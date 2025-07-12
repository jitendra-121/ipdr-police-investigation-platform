from config import TABLE_SCHEMAS
import re
from typing import Dict, List, Optional, Tuple

class SchemaMapper:
    def __init__(self):
        self.table_schemas = TABLE_SCHEMAS
        
    def analyze_data_structure(self, data: List[Dict]) -> Dict:
        """Analyze the structure of extracted data"""
        if not data or not isinstance(data, list) or not data[0]:
            return {}
            
        # Get column names from first record
        columns = list(data[0].keys())
        
        # Analyze data types
        column_types = {}
        for col in columns:
            # Sample multiple records to determine type
            sample_values = [record.get(col) for record in data[:5] if record.get(col) is not None]
            if sample_values:
                column_types[col] = self._infer_data_type(sample_values[0])
        
        return {
            "columns": columns,
            "column_count": len(columns),
            "row_count": len(data),
            "column_types": column_types
        }
    
    def _infer_data_type(self, value):
        """Infer data type from a sample value"""
        if isinstance(value, int):
            return "integer" if abs(value) < 2147483647 else "bigint"
        elif isinstance(value, float):
            # Use double precision for coordinates (latitude/longitude)
            # This is a simple heuristic - values between -180 and 180 with decimal points
            if -180 <= value <= 180 and value != int(value):
                return "double precision"
            return "numeric"
        elif isinstance(value, str):
            # Check for specific patterns
            if self._is_email(value):
                return "text"
            elif self._is_ip_address(value):
                # IP addresses are now stored as text for IPDR table
                return "text"
            elif self._is_date(value):
                return "date"
            elif self._is_time(value):
                return "time"
            else:
                return "text"
        else:
            return "text"
    
    def _is_email(self, value: str) -> bool:
        """Check if value looks like an email"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, value))
    
    def _is_ip_address(self, value: str) -> bool:
        """Check if value looks like an IP address"""
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        return bool(re.match(ip_pattern, value))
    
    def _is_date(self, value: str) -> bool:
        """Check if value looks like a date"""
        date_patterns = [
            r'^\d{4}-\d{2}-\d{2}$',  # YYYY-MM-DD
            r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$',  # YYYY-MM-DD HH:MM:SS (datetime)
            r'^\d{2}/\d{2}/\d{4}$',  # MM/DD/YYYY
            r'^\d{2}-\d{2}-\d{4}$'   # MM-DD-YYYY
        ]
        return any(re.match(pattern, value) for pattern in date_patterns)
    
    def _is_time(self, value: str) -> bool:
        """Check if value looks like a time"""
        time_pattern = r'^\d{2}:\d{2}:\d{2}$'
        return bool(re.match(time_pattern, value))
    
    def _normalize_column_name(self, col_name: str) -> str:
        """Normalize column name by converting to lowercase and replacing spaces with underscores"""
        return col_name.lower().replace(' ', '_').strip()
    
    def _get_column_mapping(self, data_columns: List[str], schema: Dict) -> Dict[str, str]:
        """Create mapping from data columns to schema columns using aliases"""
        column_mapping = {}
        
        # Get column aliases if they exist
        column_aliases = schema.get("column_aliases", {})
        required_columns = schema["required_columns"]
        
        for data_col in data_columns:
            normalized_data_col = self._normalize_column_name(data_col)
            
            # First, check direct aliases
            if data_col.lower() in column_aliases:
                column_mapping[data_col] = column_aliases[data_col.lower()]
            # Then check if normalized column matches any required column
            elif normalized_data_col in required_columns:
                column_mapping[data_col] = normalized_data_col
            # Finally, check if any required column matches when normalized
            else:
                for req_col in required_columns:
                    if normalized_data_col == req_col.lower():
                        column_mapping[data_col] = req_col
                        break
        
        return column_mapping
    
    def find_matching_table(self, data_structure: Dict) -> Tuple[Optional[str], float]:
        """Find the best matching table for the data structure"""
        best_match = None
        best_score = 0.0
        
        data_columns = data_structure["columns"]
        
        for table_name, schema in self.table_schemas.items():
            score = self._calculate_match_score(data_columns, data_structure, schema)
            
            if score > best_score:
                best_score = score
                best_match = table_name
        
        # Only return match if score is above threshold
        return (best_match, best_score) if best_score >= 0.6 else (None, best_score)
    
    def _calculate_match_score(self, data_columns: List[str], data_structure: Dict, schema: Dict) -> float:
        """Calculate how well data matches a table schema"""
        required_columns = set(schema["required_columns"])
        schema_keywords = set(word.lower() for word in schema["keywords"])
        
        # Get column mapping
        column_mapping = self._get_column_mapping(data_columns, schema)
        mapped_columns = set(column_mapping.values())
        
        # Score based on column name matches
        column_matches = len(mapped_columns.intersection(required_columns))
        column_score = column_matches / len(required_columns) if required_columns else 0
        
        # Score based on keyword presence in column names
        keyword_matches = 0
        normalized_data_cols = [self._normalize_column_name(col) for col in data_columns]
        
        for col in normalized_data_cols:
            for keyword in schema_keywords:
                if keyword in col:
                    keyword_matches += 1
                    break
        
        keyword_score = keyword_matches / len(data_columns) if data_columns else 0
        
        # Check if all required columns are present (bonus points)
        has_all_required = required_columns.issubset(mapped_columns)
        completeness_score = 1.0 if has_all_required else 0.5
        
        # Special bonus for unique identifying fields
        unique_field_bonus = 0.0
        
        # Check for unique tower_dumps identifier (roaming_a field)
        if "roaming_a" in mapped_columns:
            unique_field_bonus += 0.3  # Strong bonus for tower dumps
        
        # Check for unique IPDR identifiers
        if "landline_msidn_mdn_leased_circuit_id" in mapped_columns or "pgw_ip_address" in mapped_columns:
            unique_field_bonus += 0.3  # Strong bonus for IPDR
        
        # Check for unique bank identifiers
        if "TRAN_DATE" in mapped_columns and "PARTICULARS" in mapped_columns:
            unique_field_bonus += 0.3  # Strong bonus for bank data
        
        # Check for unique true caller identifiers
        if "s_no" in mapped_columns and "spam_score" in mapped_columns:
            unique_field_bonus += 0.3  # Strong bonus for true caller
        
        # Check for SMS header identifiers
        sms_keywords = ["sms", "message", "text", "header", "sda"]
        for col in normalized_data_cols:
            if any(keyword in col for keyword in sms_keywords):
                unique_field_bonus += 0.3  # Strong bonus for SMS header
                break
        
        # Final weighted score with unique field bonus
        base_score = (column_score * 0.6) + (keyword_score * 0.3) + (completeness_score * 0.1)
        final_score = min(1.0, base_score + unique_field_bonus)  # Cap at 1.0
        
        return final_score
    
    def validate_data_for_table(self, data: List[Dict], table_name: str) -> Tuple[bool, List[str]]:
        """Validate if data can be inserted into the specified table"""
        if table_name not in self.table_schemas:
            return False, [f"Unknown table: {table_name}"]
        
        schema = self.table_schemas[table_name]
        errors = []
        
        # Get column mapping
        data_columns = list(data[0].keys()) if data else []
        column_mapping = self._get_column_mapping(data_columns, schema)
        mapped_columns = set(column_mapping.values())
        required_columns = set(schema["required_columns"])
        
        # DEBUG: For sms_header, print column mapping details
        if table_name == 'sms_header':
            print("\n🔍 DEBUG - Column mapping for sms_header:")
            print(f"Data columns: {data_columns}")
            print(f"Column mapping: {column_mapping}")
            print(f"Mapped columns: {mapped_columns}")
            print(f"Required columns: {required_columns}")
        
        missing_columns = required_columns - mapped_columns
        if missing_columns:
            errors.append(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Check data types for a sample of records
        for i, record in enumerate(data[:3]):  # Check first 3 records
            for col, value in record.items():
                mapped_col = column_mapping.get(col, col)
                if mapped_col in schema["column_types"] and value is not None:
                    expected_type = schema["column_types"][mapped_col]
                    
                    # DEBUG: For sms_header, print detailed validation info
                    if table_name == 'sms_header':
                        print(f"\n🔍 DEBUG - Validating {col} -> {mapped_col}")
                        print(f"  Value: {value} (type: {type(value).__name__})")
                        print(f"  Expected type: {expected_type}")
                    
                    if not self._validate_data_type(value, expected_type, table_name, mapped_col):
                        errors.append(f"Row {i+1}, Column '{col}': Expected {expected_type}, got {type(value).__name__}")
        
        return len(errors) == 0, errors
    
    def _validate_data_type(self, value, expected_type: str, table_name: Optional[str] = None, column_name: Optional[str] = None) -> bool:
        """Validate if a value matches the expected data type"""
        # Special case for sms_header table - allow all types to be converted to text
        if table_name == 'sms_header':
            # All values are acceptable for text fields in sms_header
            if expected_type == "text":
                return True
                
        # Special case for subscriber table - validate type_of_connection
        if table_name == 'subscriber' and column_name == 'type_of_connection':
            if value is None:
                return True  # Allow None for type_of_connection
            if isinstance(value, str):
                # Case-insensitive check for PREPAID or POSTPAID
                return value.upper() in ['PREPAID', 'POSTPAID']
            return False
                
        # Special case for bank_details table - validate fields
        if table_name == 'bank_details':
            # Debug output for validation
            print(f"  🔍 Validating {table_name} field: {column_name}, value: {value}, type: {type(value).__name__}, expected: {expected_type}")
            
            # For numeric fields (DEBIT_AMOUNT, CREDIT_AMOUNT, BALANCE_AMOUNT)
            if column_name in ["DEBIT_AMOUNT", "CREDIT_AMOUNT", "BALANCE_AMOUNT"]:
                if isinstance(value, (int, float)):
                    return True
                if isinstance(value, str):
                    try:
                        float(value)
                        return True
                    except:
                        return False
                return False
                
            # For ACCOUNT_NO field (integer)
            if column_name == "ACCOUNT_NO":
                if isinstance(value, int):
                    return True
                if isinstance(value, float) and value.is_integer():
                    return True
                if isinstance(value, str):
                    try:
                        int(float(value))
                        return True
                    except:
                        return False
                return False
                
            # For TRAN_DATE field (must be a valid date)
            if column_name == "TRAN_DATE":
                if isinstance(value, str):
                    return self._is_date(value)
                return False
                
            # For text fields (TRAN_PARTICULAR)
            if column_name in ["TRAN_PARTICULAR"]:
                # Any value can be converted to text
                return True
        
        # Special case for tower_dumps and crd tables - more flexible validation
        if table_name in ['tower_dumps', 'crd']:
            # Debug output for validation
            print(f"  🔍 Validating {table_name} field: {column_name}, value: {value}, type: {type(value).__name__}, expected: {expected_type}")
            
            # For date field (text in tower_dumps or date type in crd)
            if column_name == "date":
                if table_name == 'tower_dumps':
                    # For tower_dumps, date is now text type
                    return isinstance(value, (str, int, float))
                elif table_name == 'crd':
                    if isinstance(value, int):
                        return True
                    if isinstance(value, float) and value.is_integer():
                        return True
                    if isinstance(value, str):
                        try:
                            int(float(value))
                            return True
                        except:
                            return self._is_date(value)
                    return False
                return False
                
            # For text fields (previously bigint in tower_dumps)
            if column_name in ["a_party", "imei_a", "imsi_a"]:
                if isinstance(value, int):
                    return True
                if isinstance(value, float) and value.is_integer():
                    return True
                if isinstance(value, str):
                    # For text fields, any string is valid
                    return True
                return False
                
            # Special handling for call_type in tower_dumps
            if table_name == 'tower_dumps' and column_name == "call_type":
                if value is None:
                    return False  # call_type is NOT NULL
                if isinstance(value, str):
                    # Check against allowed values
                    return value.upper() in ['CALL-IN', 'CALL-OUT', 'SMS-IN', 'SMS-OUT']
                return False
                
            # For other text fields
            if expected_type == "text" or column_name in ["b_party", "first_cell_id_a", "last_cell_id_a", "first_cell_id_a_address", "roaming_a"]:
                # Any value can be converted to text
                return True
                
            # For time field
            if column_name == "time":
                if table_name == 'tower_dumps':
                    # For tower_dumps, time is now text type
                    return isinstance(value, (str, int, float))
                else:
                    if isinstance(value, str):
                        return True  # Accept any string for time field
                    return False
                    
            # For duration field in tower_dumps
            if table_name == 'tower_dumps' and column_name == "duration":
                # For tower_dumps, duration is now text type
                return isinstance(value, (str, int, float))
        
        if expected_type == "text":
            return isinstance(value, str)
        elif expected_type in ["integer", "bigint"]:
            # Allow floats that can be converted to integers (like port numbers)
            if isinstance(value, float) and value.is_integer():
                return True
            return isinstance(value, int)
        elif expected_type == "numeric" or expected_type == "double precision" or expected_type == "float":
            return isinstance(value, (int, float))
        elif expected_type == "inet":
            # For IPDR data, IP addresses come as strings - validate they look like IPs
            if isinstance(value, str):
                # Check IPv4 pattern
                ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
                # Check IPv6 pattern (simplified)
                ipv6_pattern = r'^[0-9a-fA-F:]+$'
                return bool(re.match(ipv4_pattern, value)) or bool(re.match(ipv6_pattern, value)) or ':' in value
            return False
            
        # Special handling for IPDR IP address fields that are now text type
        elif table_name == "ipdr" and column_name in ["source_ip_address", "translated_ip_address", "destination_ip_address"] and expected_type == "text":
            # Accept any string as valid for IP address fields in IPDR
            return isinstance(value, str) or isinstance(value, (int, float))
        elif expected_type == "date":
            return isinstance(value, str) and self._is_date(value)
        elif expected_type == "time":
            return isinstance(value, str) and self._is_time(value)
        elif expected_type == "timestamp":
            return isinstance(value, str)
        else:
            return True  # Default to True for unknown types
    
    def get_table_info(self, table_name: str) -> Optional[Dict]:
        """Get information about a specific table"""
        return self.table_schemas.get(table_name)
    
    def normalize_column_names(self, data: List[Dict], table_name: str) -> List[Dict]:
        """Normalize column names to match database schema"""
        if table_name not in self.table_schemas:
            return data
        
        schema = self.table_schemas[table_name]
        
        # Get column mapping
        data_columns = list(data[0].keys()) if data else []
        column_mapping = self._get_column_mapping(data_columns, schema)
        
        # Apply mapping to all records
        normalized_data = []
        for record in data:
            normalized_record = {}
            for old_col, value in record.items():
                new_col = column_mapping.get(old_col, old_col)
                normalized_record[new_col] = value
            normalized_data.append(normalized_record)
        
        return normalized_data 