import sys
import asyncio
import concurrent.futures
from typing import List, Dict, Optional, Tuple
from config import SUPABASE_URL, SUPABASE_ANON_KEY

class SupabaseHandler:
    def __init__(self, verbose=False):
        self.client = None
        self.pg_connection = None
        self.verbose = verbose
        self._initialize_client()
        self._initialize_postgres_connection()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            # Check if supabase is installed
            try:
                from supabase import create_client
            except ImportError:
                if self.verbose:
                    print("Installing supabase client...")
                import subprocess
                subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase"])
                from supabase import create_client
            
            # Create client with the configured key
            self.client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            if self.verbose:
                print("✅ Connected to Supabase successfully!")
            
        except Exception as e:
            if self.verbose:
                print(f"❌ Failed to connect to Supabase: {e}")
            self.client = None
    
    def _initialize_postgres_connection(self):
        """Initialize direct PostgreSQL connection for raw SQL execution"""
        try:
            import psycopg2
            
            # Extract connection details from Supabase URL
            # Format: postgresql://[user[:password]@][netloc][:port][/dbname]
            # Supabase connection string format
            connection_string = "postgresql://postgres.whqrjyospvdjsjpujkfd:bJMtMTV6eZNNxYeRN6D4N4s5cspQLou0qTt2qjzjD40@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
            
            self.pg_connection = psycopg2.connect(connection_string)
            if self.verbose:
                print("✅ PostgreSQL connection established for direct SQL execution!")
                
        except ImportError:
            if self.verbose:
                print("⚠️ psycopg2 not installed. Installing...")
            try:
                import subprocess
                subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
                import psycopg2
                connection_string = "postgresql://postgres.whqrjyospvdjsjpujkfd:bJMtMTV6eZNNxYeRN6D4N4s5cspQLou0qTt2qjzjD40@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
                self.pg_connection = psycopg2.connect(connection_string)
                if self.verbose:
                    print("✅ PostgreSQL connection established after installing psycopg2!")
            except Exception as e:
                if self.verbose:
                    print(f"❌ Failed to install/connect psycopg2: {e}")
                self.pg_connection = None
        except Exception as e:
            if self.verbose:
                print(f"❌ Failed to connect to PostgreSQL: {e}")
            self.pg_connection = None
    
    def execute_raw_sql(self, sql_query: str) -> Tuple[bool, str, List[Dict]]:
        """
        Execute raw SQL query directly against PostgreSQL database
        This bypasses all parsing and executes the SQL as-is
        """
        print(f"\n🔥 [RAW SQL] Executing direct SQL query:")
        print(f"   📝 SQL: {sql_query}")
        
        if not self.pg_connection:
            error_msg = "PostgreSQL connection not available"
            print(f"   ❌ {error_msg}")
            return False, error_msg, []
        
        try:
            cursor = self.pg_connection.cursor()
            
            # Execute the raw SQL
            print(f"   ⚡ Executing query directly...")
            cursor.execute(sql_query)
            
            # Fetch results
            if cursor.description:  # SELECT query
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                # Convert to list of dictionaries
                results = []
                for row in rows:
                    record = {}
                    for i, value in enumerate(row):
                        record[columns[i]] = value
                    results.append(record)
                
                print(f"   ✅ Query successful! Retrieved {len(results)} records")
                if results:
                    print(f"   📋 Columns: {list(results[0].keys())}")
                
                cursor.close()
                return True, f"Successfully executed SQL query, retrieved {len(results)} records", results
            else:  # Non-SELECT query (INSERT, UPDATE, DELETE)
                affected_rows = cursor.rowcount
                self.pg_connection.commit()
                cursor.close()
                print(f"   ✅ Query successful! Affected {affected_rows} rows")
                return True, f"Successfully executed SQL query, affected {affected_rows} rows", []
                
        except Exception as e:
            error_msg = f"SQL execution failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            try:
                self.pg_connection.rollback()
            except:
                pass
            return False, error_msg, []
    
    def test_connection(self) -> bool:
        """Test if connection to Supabase is working"""
        if not self.client:
            return False
        
        try:
            # Try a simple query to test connection
            result = self.client.table('bank_details').select("id").limit(1).execute()
            return True
        except Exception as e:
            if self.verbose:
                print(f"Connection test failed: {e}")
            return False
    
    def insert_data_ultra_fast(self, table_name: str, data: List[Dict]) -> Tuple[bool, str, Optional[int]]:
        """ULTRA-FAST: Maximum speed insertion with large batches and minimal overhead"""
        if not self.client:
            return False, "Supabase client not initialized", None
        
        if not data:
            return False, "No data to insert", None
        
        try:
            # Remove 'id' field if present (auto-generated) - optimized list comprehension
            cleaned_data = [{k: v for k, v in record.items() if k.lower() != 'id'} for record in data]
            
            # SPEED OPTIMIZATION: Use very large batch size for maximum throughput
            batch_size = 2000  # Increased from 100 to 2000 for maximum speed
            total_inserted = 0
            total_batches = (len(cleaned_data) + batch_size - 1) // batch_size
            
            if self.verbose:
                print(f"🚀 ULTRA-FAST MODE: Processing {len(cleaned_data):,} records in {total_batches} batches of {batch_size}")
            
            # Process batches with minimal error handling for maximum speed
            for i in range(0, len(cleaned_data), batch_size):
                batch = cleaned_data[i:i + batch_size]
                batch_num = (i // batch_size) + 1
                
                try:
                    result = self.client.table(table_name).insert(batch).execute()
                    
                    # Optimized result counting
                    batch_inserted = len(result.data) if hasattr(result, 'data') and result.data else len(batch)
                    total_inserted += batch_inserted
                    
                    if self.verbose and batch_num % 5 == 0:  # Only show progress every 5 batches
                        print(f"   ⚡ Batch {batch_num}/{total_batches}: {batch_inserted:,} records")
                        
                except Exception:
                    # For ultra-fast mode, skip detailed error handling
                    # Try smaller chunks only if needed
                    chunk_size = 500
                    for j in range(0, len(batch), chunk_size):
                        chunk = batch[j:j + chunk_size]
                        try:
                            chunk_result = self.client.table(table_name).insert(chunk).execute()
                            total_inserted += len(chunk_result.data) if hasattr(chunk_result, 'data') and chunk_result.data else len(chunk)
                        except:
                            continue  # Skip failed chunks for maximum speed
            
            return True, f"Ultra-fast insertion: {total_inserted:,} records", total_inserted
                
        except Exception as e:
            return False, f"Ultra-fast insertion failed: {str(e)}", None
    
    def insert_data_parallel(self, table_name: str, data: List[Dict], max_workers: int = 6) -> Tuple[bool, str, Optional[int]]:
        """PARALLEL: Multi-threaded insertion for maximum throughput"""
        if not self.client:
            return False, "Supabase client not initialized", None
        
        if not data:
            return False, "No data to insert", None
        
        try:
            # Clean data
            cleaned_data = [{k: v for k, v in record.items() if k.lower() != 'id'} for record in data]
            
            # Split data into chunks for parallel processing - larger chunks for speed
            chunk_size = max(2000, len(cleaned_data) // max_workers)
            chunks = [cleaned_data[i:i + chunk_size] for i in range(0, len(cleaned_data), chunk_size)]
            
            if self.verbose:
                print(f"🚀 PARALLEL MODE: Processing {len(cleaned_data):,} records in {len(chunks)} parallel chunks (workers: {max_workers})")
            
            total_inserted = 0
            
            # Use ThreadPoolExecutor for parallel processing
            with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
                # Submit all chunks for parallel processing
                future_to_chunk = {
                    executor.submit(self._insert_chunk_fast, table_name, chunk, i+1): i 
                    for i, chunk in enumerate(chunks)
                }
                
                # Collect results as they complete
                for future in concurrent.futures.as_completed(future_to_chunk):
                    chunk_index = future_to_chunk[future]
                    try:
                        inserted_count = future.result()
                        total_inserted += inserted_count
                        if self.verbose:
                            print(f"   ⚡ Chunk {chunk_index+1}/{len(chunks)}: {inserted_count:,} records")
                    except Exception as e:
                        if self.verbose:
                            print(f"   ⚠️  Chunk {chunk_index+1} failed: {str(e)[:30]}...")
            
            return True, f"Parallel insertion: {total_inserted:,} records", total_inserted
                
        except Exception as e:
            return False, f"Parallel insertion failed: {str(e)}", None
    
    def _insert_chunk_fast(self, table_name: str, chunk: List[Dict], chunk_id: int) -> int:
        """Optimized helper method to insert a single chunk with maximum speed"""
        try:
            # Try large batch first
            result = self.client.table(table_name).insert(chunk).execute()
            return len(result.data) if hasattr(result, 'data') and result.data else len(chunk)
        except Exception:
            # If large chunk fails, try medium batches
            inserted = 0
            batch_size = 500
            for i in range(0, len(chunk), batch_size):
                batch = chunk[i:i + batch_size]
                try:
                    batch_result = self.client.table(table_name).insert(batch).execute()
                    inserted += len(batch_result.data) if hasattr(batch_result, 'data') and batch_result.data else len(batch)
                except:
                    # Try smaller batches as last resort
                    small_batch_size = 100
                    for j in range(0, len(batch), small_batch_size):
                        small_batch = batch[j:j + small_batch_size]
                        try:
                            small_result = self.client.table(table_name).insert(small_batch).execute()
                            inserted += len(small_result.data) if hasattr(small_result, 'data') and small_result.data else len(small_batch)
                        except:
                            continue
            return inserted
    
    def insert_data(self, table_name: str, data: List[Dict]) -> Tuple[bool, str, Optional[int]]:
        """Smart insertion method - automatically chooses optimal strategy based on data size"""
        if not data:
            return False, "No data to insert", None
        
        # DEBUG: Print insertion details
        print(f"\n🔍 DEBUG - Attempting to insert {len(data)} records into '{table_name}'")
        
        # For tower_dumps or crd, print the first record to debug
        if table_name in ['tower_dumps', 'crd'] and len(data) > 0:
            print(f"\n🔍 DEBUG - First record to insert into {table_name}:")
            for key, value in data[0].items():
                print(f"  {key}: {type(value).__name__} = {value}")
                
        # Pre-process CRD data to ensure proper types
        if table_name == 'crd':
            for record in data:
                # Convert phone numbers, IMEI and IMSI to strings
                for field in ['a_party', 'b_party', 'imei_a', 'imsi_a']:
                    if field in record and not isinstance(record[field], str):
                        record[field] = str(record[field])
                        
                # Ensure latitude and longitude are proper double precision values
                for field in ['latitude', 'longitude']:
                    if field in record:
                        if isinstance(record[field], (int, float)):
                            record[field] = float(record[field])
                        elif isinstance(record[field], str):
                            try:
                                record[field] = float(record[field])
                            except ValueError:
                                record[field] = 0.0
                        else:
                            record[field] = 0.0
        
        # Pre-process bank_details data to ensure proper types
        if table_name == 'bank_details':
            for record in data:
                # Ensure TRAN_DATE is a valid date format
                if 'TRAN_DATE' in record:
                    if isinstance(record['TRAN_DATE'], str):
                        # Keep as is - will be validated as date
                        pass
                    elif isinstance(record['TRAN_DATE'], (int, float)):
                        # Try to convert to date string
                        try:
                            from datetime import datetime
                            # Assuming it's a timestamp
                            dt = datetime.fromtimestamp(record['TRAN_DATE'])
                            record['TRAN_DATE'] = dt.strftime('%Y-%m-%d')
                        except:
                            # If conversion fails, use a placeholder
                            record['TRAN_DATE'] = '2000-01-01'
                
                # Ensure ACCOUNT_NO is integer
                if 'ACCOUNT_NO' in record:
                    if isinstance(record['ACCOUNT_NO'], int):
                        # Keep as is
                        pass
                    elif isinstance(record['ACCOUNT_NO'], float):
                        # Convert to integer
                        record['ACCOUNT_NO'] = int(record['ACCOUNT_NO'])
                    elif isinstance(record['ACCOUNT_NO'], str):
                        # Try to convert string to integer
                        try:
                            record['ACCOUNT_NO'] = int(float(record['ACCOUNT_NO']))
                        except:
                            # If conversion fails, use a placeholder
                            record['ACCOUNT_NO'] = 0
                
                # Convert text fields
                if 'TRAN_PARTICULAR' in record and not isinstance(record['TRAN_PARTICULAR'], str):
                    record['TRAN_PARTICULAR'] = str(record['TRAN_PARTICULAR']) if record['TRAN_PARTICULAR'] is not None else ""
                
                # Ensure numeric fields are proper numeric values
                for field in ['DEBIT_AMOUNT', 'CREDIT_AMOUNT', 'BALANCE_AMOUNT']:
                    if field in record:
                        if isinstance(record[field], (int, float)):
                            record[field] = float(record[field])
                        elif isinstance(record[field], str):
                            try:
                                record[field] = float(record[field])
                            except ValueError:
                                record[field] = 0.0
                        else:
                            record[field] = 0.0
        
        # Pre-process tower_dumps data to ensure proper types
        if table_name == 'tower_dumps':
            for record in data:
                # Convert all text fields
                for field in ['a_party', 'b_party', 'date', 'time', 'duration', 'imei_a', 'imsi_a', 
                             'first_cell_id_a', 'last_cell_id_a', 'first_cell_id_a_address', 'roaming_a']:
                    if field in record and not isinstance(record[field], str):
                        record[field] = str(record[field])
                
                # Ensure call_type is one of the allowed values
                if 'call_type' in record:
                    if isinstance(record['call_type'], str):
                        call_type = record['call_type'].upper()
                        if call_type not in ['CALL-IN', 'CALL-OUT', 'SMS-IN', 'SMS-OUT']:
                            # Default to CALL-IN if not valid
                            record['call_type'] = 'CALL-IN'
                    else:
                        # Convert non-string values to string and default to CALL-IN
                        record['call_type'] = 'CALL-IN'
                
                # Ensure latitude and longitude are proper double precision values
                for field in ['latitude', 'longitude']:
                    if field in record:
                        if isinstance(record[field], (int, float)):
                            record[field] = float(record[field])
                        elif isinstance(record[field], str):
                            try:
                                record[field] = float(record[field])
                            except ValueError:
                                record[field] = 0.0
                        else:
                            record[field] = 0.0
        
        # Pre-process IPDR data to ensure proper types
        if table_name == 'ipdr':
            for record in data:
                # Convert text fields that were previously bigint
                for field in ['landline_msidn_mdn_leased_circuit_id', 'user_id']:
                    if field in record and not isinstance(record[field], str):
                        record[field] = str(record[field])
                
                # Convert IP address fields to text
                for field in ['source_ip_address', 'translated_ip_address', 'destination_ip_address']:
                    if field in record and not isinstance(record[field], str):
                        record[field] = str(record[field])
        
        data_size = len(data)
        
        if data_size > 10000:
            # Use parallel processing for very large datasets
            if self.verbose:
                print(f"📊 Large dataset ({data_size:,} records) - Using PARALLEL processing")
            return self.insert_data_parallel(table_name, data, max_workers=6)
        elif data_size > 1000:
            # Use ultra-fast mode for medium-large datasets
            if self.verbose:
                print(f"📊 Medium dataset ({data_size:,} records) - Using ULTRA-FAST processing")
            return self.insert_data_ultra_fast(table_name, data)
        else:
            # Use original method for small datasets (with debugging)
            if self.verbose:
                print(f"📊 Small dataset ({data_size:,} records) - Using STANDARD processing")
            return self._insert_data_original(table_name, data)
    
    def _insert_data_original(self, table_name: str, data: List[Dict]) -> Tuple[bool, str, Optional[int]]:
        """Original insertion method with full debugging (for small datasets)"""
        try:
            # Remove 'id' field if present (auto-generated)
            cleaned_data = [{k: v for k, v in record.items() if k.lower() != 'id'} for record in data]
            
            # For debugging, try inserting just the first record to get detailed error
            if self.verbose or table_name in ['sms_header', 'tower_dumps']:
                print(f"🔍 Attempting to insert first record for debugging...")
                try:
                    first_record = cleaned_data[0]
                    print(f"🔍 First record: {first_record}")
                    debug_result = self.client.table(table_name).insert(first_record).execute()
                    print(f"✅ First record inserted successfully")
                    print(f"🔍 Response: {debug_result}")
                except Exception as debug_error:
                    print(f"❌ First record failed: {str(debug_error)}")
                    
                    # Try with more specific error handling for bank_details, tower_dumps and crd
                    if table_name in ['bank_details', 'tower_dumps', 'crd']:
                        print(f"\n🔧 Attempting to fix {table_name} record...")
                        fixed_record = {}
                        for key, value in first_record.items():
                            if table_name == 'tower_dumps':
                                if key in ['a_party', 'b_party', 'date', 'time', 'duration', 'imei_a', 'imsi_a', 
                                          'first_cell_id_a', 'last_cell_id_a', 'first_cell_id_a_address', 'roaming_a']:
                                    # Convert all text fields to strings
                                    fixed_record[key] = str(value) if value is not None else ""
                                elif key == 'call_type':
                                    # Ensure call_type is one of the allowed values
                                    if isinstance(value, str):
                                        call_type = value.upper()
                                        if call_type in ['CALL-IN', 'CALL-OUT', 'SMS-IN', 'SMS-OUT']:
                                            fixed_record[key] = call_type
                                        else:
                                            fixed_record[key] = 'CALL-IN'  # Default value
                                    else:
                                        fixed_record[key] = 'CALL-IN'  # Default value
                                elif key in ['latitude', 'longitude']:
                                    # Ensure proper double precision format
                                    if isinstance(value, (int, float)):
                                        fixed_record[key] = float(value)
                                    elif isinstance(value, str):
                                        try:
                                            fixed_record[key] = float(value)
                                        except ValueError:
                                            fixed_record[key] = 0.0
                                    else:
                                        fixed_record[key] = 0.0
                                else:
                                    fixed_record[key] = value
                            elif table_name == 'crd':
                                if key in ['a_party', 'imei_a', 'imsi_a'] and isinstance(value, (int, float)):
                                    # Convert to string for text fields (previously bigint)
                                    fixed_record[key] = str(int(value))
                                elif key == 'date' and isinstance(value, (int, float)):
                                    # Convert date to string
                                    fixed_record[key] = str(int(value))
                                elif key in ['latitude', 'longitude']:
                                    # Ensure proper double precision format
                                    if isinstance(value, (int, float)):
                                        fixed_record[key] = float(value)
                                    elif isinstance(value, str):
                                        try:
                                            fixed_record[key] = float(value)
                                        except ValueError:
                                            fixed_record[key] = 0.0
                                    else:
                                        fixed_record[key] = 0.0
                                else:
                                    fixed_record[key] = value
                            elif table_name == 'bank_details':
                                if key == 'ACCOUNT_NO':
                                    # Ensure ACCOUNT_NO is integer
                                    if isinstance(value, int):
                                        fixed_record[key] = value
                                    elif isinstance(value, float):
                                        fixed_record[key] = int(value)
                                    elif isinstance(value, str):
                                        try:
                                            fixed_record[key] = int(float(value))
                                        except:
                                            fixed_record[key] = 0
                                    else:
                                        fixed_record[key] = 0
                                elif key == 'TRAN_DATE':
                                    # Ensure TRAN_DATE is a valid date format
                                    if isinstance(value, str):
                                        fixed_record[key] = value
                                    else:
                                        # Use a placeholder date
                                        fixed_record[key] = '2000-01-01'
                                elif key == 'TRAN_PARTICULAR':
                                    # Convert to string
                                    fixed_record[key] = str(value) if value is not None else ""
                                elif key in ['DEBIT_AMOUNT', 'CREDIT_AMOUNT', 'BALANCE_AMOUNT']:
                                    # Ensure proper numeric format
                                    if isinstance(value, (int, float)):
                                        fixed_record[key] = float(value)
                                    elif isinstance(value, str):
                                        try:
                                            fixed_record[key] = float(value)
                                        except ValueError:
                                            fixed_record[key] = 0.0
                                    else:
                                        fixed_record[key] = 0.0
                                else:
                                    fixed_record[key] = value
                            else:
                                fixed_record[key] = value
                                
                        print(f"🔍 Fixed record: {fixed_record}")
                        try:
                            debug_result = self.client.table(table_name).insert(fixed_record).execute()
                            print(f"✅ Fixed record inserted successfully")
                        except Exception as fixed_error:
                            print(f"❌ Fixed record failed: {str(fixed_error)}")
                    
                    return False, f"Data format error: {str(debug_error)}", None
            
            # Insert data in batches
            total_inserted = 0
            batch_size = 500  # Increased from 100 for better performance
            
            for i in range(0, len(cleaned_data), batch_size):
                batch = cleaned_data[i:i + batch_size]
                
                try:
                    result = self.client.table(table_name).insert(batch).execute()
                    
                    if hasattr(result, 'data') and result.data:
                        total_inserted += len(result.data)
                    else:
                        total_inserted += len(batch)
                        
                except Exception as batch_error:
                    if self.verbose:
                        print(f"❌ Batch insertion failed: {str(batch_error)}")
                    
                    # If batch fails, try individual records
                    for j, record in enumerate(batch):
                        try:
                            single_result = self.client.table(table_name).insert(record).execute()
                            if hasattr(single_result, 'data') and single_result.data:
                                total_inserted += 1
                        except Exception as single_error:
                            if self.verbose:
                                print(f"❌ Record {i+j+1} failed: {str(single_error)}")
                            continue
            
            if total_inserted > 0:
                return True, f"Successfully inserted {total_inserted} records", total_inserted
            else:
                return False, "Failed to insert any records - check data format and constraints", 0
                
        except Exception as e:
            return False, f"Insertion error: {str(e)}", None
    
    def get_table_info(self, table_name: str) -> Optional[Dict]:
        """Get information about a table structure"""
        if not self.client:
            return None
        
        try:
            # Try to get one record to understand structure
            result = self.client.table(table_name).select("*").limit(1).execute()
            
            if hasattr(result, 'data') and result.data:
                return {
                    "columns": list(result.data[0].keys()) if result.data else [],
                    "sample_record": result.data[0] if result.data else None
                }
            else:
                return {"columns": [], "sample_record": None}
                
        except Exception as e:
            if self.verbose:
                print(f"Error getting table info for {table_name}: {e}")
            return None
    
    def check_table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database"""
        if not self.client:
            return False
        
        try:
            # Try to query the table
            result = self.client.table(table_name).select("*").limit(1).execute()
            return True
        except Exception:
            return False
    
    def get_record_count(self, table_name: str) -> Optional[int]:
        """Get the number of records in a table"""
        if not self.client:
            return None
        
        try:
            result = self.client.table(table_name).select("id").execute()
            return len(result.data) if hasattr(result, 'data') and result.data else 0
        except Exception as e:
            if self.verbose:
                print(f"Error getting record count for {table_name}: {e}")
            return None
    
    def validate_data_format(self, data: List[Dict], table_name: str) -> Tuple[bool, List[str]]:
        """Validate data format before insertion"""
        errors = []
        
        if not data:
            errors.append("No data provided")
            return False, errors
        
        if not isinstance(data, list):
            errors.append("Data must be a list of dictionaries")
            return False, errors
        
        # Check if all items are dictionaries (sample only for speed)
        for i, record in enumerate(data[:3]):  # Check only first 3 records for speed
            if not isinstance(record, dict):
                errors.append(f"Record {i+1} is not a dictionary")
        
        return len(errors) == 0, errors
    
    def preview_insertion(self, data: List[Dict], table_name: str, preview_count: int = 2) -> Dict:
        """Preview what will be inserted without actually inserting (reduced preview for speed)"""
        preview_data = data[:preview_count] if len(data) > preview_count else data
        
        # Remove id fields for preview
        cleaned_preview = [{k: v for k, v in record.items() if k.lower() != 'id'} for record in preview_data]
        
        return {
            "table_name": table_name,
            "total_records": len(data),
            "preview_records": cleaned_preview,
            "columns": list(cleaned_preview[0].keys()) if cleaned_preview else []
        }
    
    def close_connection(self):
        """Close the Supabase connection"""
        # Supabase client doesn't need explicit closing
        self.client = None
        if self.verbose:
            print("Supabase connection closed")
    
    # ================== NEW: REAL SQL QUERY EXECUTION METHODS ==================
    
    def execute_select_query(self, table_name: str, columns: str = "*", filters: Dict = None, 
                           limit: int = 1000, order_by: Optional[str] = None) -> Tuple[bool, str, List[Dict]]:
        """
        Execute a SELECT query on the specified table with optional filters
        
        Args:
            table_name: Name of the table to query
            columns: Columns to select (default: "*")
            filters: Dictionary of column:value pairs for WHERE conditions
            limit: Maximum number of records to return
            order_by: Column name to order by
        
        Returns:
            Tuple of (success, message, data)
        """
        print(f"\n🔍 [SQL EXEC] Starting SELECT query on table '{table_name}'")
        print(f"   📊 Columns: {columns}")
        print(f"   🔧 Filters: {filters}")
        print(f"   📏 Limit: {limit}")
        
        if not self.client:
            error_msg = "Supabase client not initialized"
            print(f"   ❌ {error_msg}")
            return False, error_msg, []
        
        try:
            # Start building the query
            print(f"   🏗️  Building query for table '{table_name}'...")
            query = self.client.table(table_name).select(columns)
            
            # Apply filters if provided
            if filters:
                print(f"   🎯 Applying {len(filters)} filter(s)...")
                for column, value in filters.items():
                    print(f"      - {column} = {value}")
                    query = query.eq(column, value)
            
            # Apply ordering if specified
            if order_by:
                print(f"   📈 Ordering by: {order_by}")
                query = query.order(order_by)
            
            # Apply limit
            if limit:
                print(f"   📏 Limiting to {limit} records")
                query = query.limit(limit)
            
            # Execute the query
            print(f"   ⚡ Executing query...")
            result = query.execute()
            
            # Process results
            if hasattr(result, 'data') and result.data is not None:
                record_count = len(result.data)
                print(f"   ✅ Query successful! Retrieved {record_count} records")
                
                if record_count > 0:
                    print(f"   📋 Sample record keys: {list(result.data[0].keys())}")
                else:
                    print(f"   ℹ️  No records found matching criteria")
                
                return True, f"Successfully retrieved {record_count} records", result.data
            else:
                print(f"   ⚠️  Query returned no data")
                return True, "Query executed but returned no data", []
                
        except Exception as e:
            error_msg = f"Query execution failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            return False, error_msg, []
    
    def execute_investigation_query(self, query_info: Dict) -> Dict:
        """
        Execute an investigation query based on AI-generated query information
        Uses direct SQL execution - NO PARSING!
        
        Args:
            query_info: Dictionary containing query details from AI agent
        
        Returns:
            Dictionary with execution results and metadata
        """
        purpose = query_info.get("purpose", "Unknown purpose")
        table = query_info.get("table", "unknown_table")
        sql_query = query_info.get("sql", "")
        
        print(f"\n🕵️ [INVESTIGATION] Executing query: {purpose}")
        print(f"   🎯 Target table: {table}")
        
        # Execute the SQL directly without any parsing!
        success, message, data = self.execute_raw_sql(sql_query)
        
        # Prepare result
        result = {
            "purpose": purpose,
            "table": table,
            "success": success,
            "message": message,
            "row_count": len(data) if data else 0,
            "actual_data": data[:10] if data else [],  # First 10 records for preview
            "total_records_available": len(data) if data else 0,
            "query_metadata": {
                "original_sql": sql_query,
                "execution_method": "direct_sql",
                "note": "SQL executed directly without parsing"
            }
        }
        
        if success:
            print(f"   ✅ Investigation query completed: {len(data)} records retrieved")
        else:
            print(f"   ❌ Investigation query failed: {message}")
        
        return result
    
    def _parse_sql_filters(self, sql_query: str) -> Dict:
        """
        Parse SQL WHERE conditions into a filters dictionary
        This is a simplified parser for basic conditions
        """
        filters = {}
        
        if not sql_query:
            return filters
        
        sql_lower = sql_query.lower()
        
        # Check for OR conditions first
        if ' or ' in sql_lower:
            print(f"   ⚠️ OR condition detected - PostgREST requires special handling")
            # For OR conditions, we'll extract the first condition only
            # PostgREST OR queries need different syntax: ?column=eq.value1&column=eq.value2
            # For now, we'll use the first condition as primary filter
            or_parts = sql_lower.split(' or ')
            if or_parts:
                # Use the first part for basic filtering
                sql_lower = or_parts[0]
        
        # Look for basic WHERE conditions like "column = 'value'"
        import re
        
        # Pattern for simple equality conditions
        patterns = [
            r"(\w+)\s*=\s*'([^']+)'",  # column = 'value'
            r"(\w+)\s*=\s*(\d+)",      # column = number
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, sql_lower)
            for column, value in matches:
                # Try to convert numeric values
                try:
                    if isinstance(value, str) and value.isdigit():
                        filters[column] = int(value)
                    else:
                        filters[column] = value
                except:
                    filters[column] = value
        
        return filters
    
    def _parse_sql_columns(self, sql_query: str) -> str:
        """Parse SELECT columns from SQL query"""
        if not sql_query:
            return "*"
        
        # Simple pattern to extract columns between SELECT and FROM
        import re
        match = re.search(r'select\s+(.*?)\s+from', sql_query.lower())
        if match:
            columns = match.group(1).strip()
            
            # Handle aggregate functions and aliases for PostgREST
            if 'sum(' in columns.lower() or 'count(' in columns.lower() or 'avg(' in columns.lower():
                # For aggregate functions, PostgREST has special requirements
                # We'll need to use basic columns and handle aggregation differently
                print(f"   ⚠️ Aggregate function detected, using simple column selection")
                return "*"  # Fallback to all columns for aggregate queries
            
            # Fix spacing issues with aliases
            columns = re.sub(r'\s+as\s+', ' as ', columns)  # Normalize AS spacing
            columns = re.sub(r'(\w+)\s*as\s*(\w+)', r'\1 as \2', columns)  # Fix alias spacing
            
            return columns if columns else "*"
        
        return "*"
    
    def _parse_sql_limit(self, sql_query: str) -> int:
        """Parse LIMIT from SQL query"""
        if not sql_query:
            return 1000
        
        import re
        match = re.search(r'limit\s+(\d+)', sql_query.lower())
        if match:
            return int(match.group(1))
        
        return 1000  # Default limit
    
    def _parse_sql_order(self, sql_query: str) -> Optional[str]:
        """Parse ORDER BY from SQL query"""
        if not sql_query:
            return None
        
        import re
        match = re.search(r'order\s+by\s+(\w+)', sql_query.lower())
        if match:
            return match.group(1)
        
        return None
    
    def _is_aggregate_query(self, sql_query: str) -> bool:
        """Check if SQL query contains aggregate functions"""
        if not sql_query:
            return False
        
        sql_lower = sql_query.lower()
        aggregate_functions = ['count(', 'sum(', 'avg(', 'max(', 'min(', 'group by']
        
        return any(func in sql_lower for func in aggregate_functions)
    
    def _is_aggregate_alias(self, column_name: str, sql_query: str) -> bool:
        """Check if column name is an alias from aggregate function"""
        if not sql_query or not column_name:
            return False
        
        sql_lower = sql_query.lower()
        column_lower = column_name.lower()
        
        # Common aggregate aliases
        aggregate_aliases = ['call_count', 'total_count', 'sum_amount', 'avg_duration', 'max_value', 'min_value']
        
        # Check if the column is a known aggregate alias
        if column_lower in aggregate_aliases:
            return True
        
        # Check if the column appears after "as" keyword
        import re
        as_pattern = rf'as\s+{re.escape(column_lower)}'
        return bool(re.search(as_pattern, sql_lower))
    
    def _execute_aggregate_query_simplified(self, query_info: Dict) -> Dict:
        """
        Execute aggregate queries using a simplified approach
        Since PostgREST doesn't handle complex aggregates well, we'll fetch basic data
        and provide a meaningful response about the data structure
        """
        purpose = query_info.get("purpose", "Unknown purpose")
        table = query_info.get("table", "unknown_table")
        sql_query = query_info.get("sql", "")
        
        print(f"   🔄 Executing simplified aggregate query for table: {table}")
        
        # For aggregate queries, we'll fetch sample data and provide insights
        success, message, data = self.execute_select_query(
            table_name=table,
            columns="*",
            filters={},  # No filters for aggregate overview
            limit=100,   # Reasonable sample size
            order_by=None
        )
        
        if success and data:
            # Analyze the data to provide aggregate-like insights
            insights = self._analyze_data_for_aggregates(data, sql_query)
            
            result = {
                "purpose": purpose,
                "table": table,
                "success": True,
                "message": f"Simplified aggregate analysis completed. Found {len(data)} sample records.",
                "row_count": len(data),
                "actual_data": data[:5],  # Show first 5 records
                "total_records_available": len(data),
                "aggregate_insights": insights,
                "query_metadata": {
                    "original_sql": sql_query,
                    "execution_method": "simplified_aggregate",
                    "note": "PostgREST limitations require simplified aggregate handling"
                }
            }
            
            print(f"   ✅ Simplified aggregate completed: {len(data)} records analyzed")
            return result
        else:
            # Failed to get even basic data
            result = {
                "purpose": purpose,
                "table": table,
                "success": False,
                "message": f"Failed to execute simplified aggregate query: {message}",
                "row_count": 0,
                "actual_data": [],
                "total_records_available": 0,
                "query_metadata": {
                    "original_sql": sql_query,
                    "execution_method": "simplified_aggregate_failed"
                }
            }
            
            print(f"   ❌ Simplified aggregate failed: {message}")
            return result
    
    def _analyze_data_for_aggregates(self, data: List[Dict], sql_query: str) -> Dict:
        """Analyze data to provide aggregate-like insights"""
        if not data:
            return {"note": "No data available for analysis"}
        
        insights = {
            "sample_size": len(data),
            "columns_available": list(data[0].keys()) if data else [],
            "analysis_type": "sample_based"
        }
        
        # Basic aggregate insights based on common patterns
        sql_lower = sql_query.lower()
        
        if 'count' in sql_lower:
            insights["count_analysis"] = f"Sample contains {len(data)} records"
        
        if 'group by' in sql_lower:
            # Try to identify the grouping column
            import re
            group_match = re.search(r'group\s+by\s+(\w+)', sql_lower)
            if group_match:
                group_column = group_match.group(1)
                if group_column in data[0]:
                    unique_values = set(str(record.get(group_column, '')) for record in data)
                    insights["grouping_analysis"] = f"Found {len(unique_values)} unique values in '{group_column}' column"
        
        return insights
    
    def get_table_statistics(self, table_name: str) -> Dict:
        """
        Get comprehensive statistics about a table
        
        Returns:
            Dictionary with table statistics
        """
        print(f"\n📊 [STATS] Gathering statistics for table '{table_name}'")
        
        if not self.client:
            print(f"   ❌ Supabase client not initialized")
            return {"error": "Client not initialized"}
        
        try:
            # Get total record count
            print(f"   🔢 Counting total records...")
            count_result = self.client.table(table_name).select("id", count="exact").execute()
            total_records = count_result.count if hasattr(count_result, 'count') else 0
            
            # Get sample records to understand structure
            print(f"   📋 Fetching sample records...")
            sample_result = self.client.table(table_name).select("*").limit(5).execute()
            sample_data = sample_result.data if hasattr(sample_result, 'data') else []
            
            # Get column information
            columns = list(sample_data[0].keys()) if sample_data else []
            
            stats = {
                "table_name": table_name,
                "total_records": total_records,
                "columns": columns,
                "column_count": len(columns),
                "sample_records": sample_data,
                "has_data": total_records > 0
            }
            
            print(f"   ✅ Statistics gathered:")
            print(f"      📊 Total records: {total_records}")
            print(f"      📋 Columns: {len(columns)}")
            print(f"      🔍 Sample available: {len(sample_data)} records")
            
            return stats
            
        except Exception as e:
            error_msg = f"Failed to get table statistics: {str(e)}"
            print(f"   ❌ {error_msg}")
            return {"error": error_msg}
    
    def execute_batch_investigation_queries(self, query_list: List[Dict]) -> Dict:
        """
        Execute multiple investigation queries in batch
        
        Args:
            query_list: List of query dictionaries from AI agents
        
        Returns:
            Dictionary with all execution results
        """
        print(f"\n🔄 [BATCH EXEC] Starting batch execution of {len(query_list)} queries")
        
        results = {}
        successful_queries = 0
        failed_queries = 0
        total_records = 0
        
        for i, query_info in enumerate(query_list, 1):
            print(f"\n   📋 [{i}/{len(query_list)}] Processing query...")
            
            try:
                result = self.execute_investigation_query(query_info)
                table_name = result.get("table", f"query_{i}")
                results[table_name] = result
                
                if result.get("success", False):
                    successful_queries += 1
                    total_records += result.get("row_count", 0)
                    print(f"      ✅ Query {i} successful: {result.get('row_count', 0)} records")
                else:
                    failed_queries += 1
                    print(f"      ❌ Query {i} failed: {result.get('message', 'Unknown error')}")
                    
            except Exception as e:
                failed_queries += 1
                error_result = {
                    "purpose": query_info.get("purpose", "Unknown"),
                    "table": query_info.get("table", f"query_{i}"),
                    "success": False,
                    "message": f"Execution error: {str(e)}",
                    "row_count": 0,
                    "actual_data": [],
                    "error": str(e)
                }
                results[f"query_{i}"] = error_result
                print(f"      ❌ Query {i} exception: {str(e)}")
        
        # Summary
        execution_summary = {
            "total_queries": len(query_list),
            "successful_queries": successful_queries,
            "failed_queries": failed_queries,
            "total_records_retrieved": total_records,
            "success_rate": (successful_queries / len(query_list)) * 100 if query_list else 0
        }
        
        print(f"\n📈 [BATCH SUMMARY]")
        print(f"   🎯 Total queries: {execution_summary['total_queries']}")
        print(f"   ✅ Successful: {execution_summary['successful_queries']}")
        print(f"   ❌ Failed: {execution_summary['failed_queries']}")
        print(f"   📊 Total records: {execution_summary['total_records_retrieved']}")
        print(f"   📈 Success rate: {execution_summary['success_rate']:.1f}%")
        
        return {
            "success": successful_queries > 0,
            "message": f"Batch execution completed: {successful_queries}/{len(query_list)} queries successful",
            "data": results,
            "execution_summary": execution_summary
        } 