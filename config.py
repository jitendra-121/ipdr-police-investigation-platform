import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API Configuration (Hardcoded)
OPENAI_API_KEY = os.getenv('VITE_OPENAI_API_KEY')
OPENAI_BASE_URL = "https://api.openai.com/v1"
OPENAI_MODEL = "gpt-4o-mini"

# Legacy GitHub Models Configuration (Deprecated - using OpenAI instead)
# GitHub Models API key - now loaded from environment variables
# GITHUB_MODELS_BASE_URL = "https://models.inference.ai.azure.com"
# GITHUB_MODELS_MODEL = "gpt-4o"

# Legacy OpenAI Configuration (Deprecated - using GitHub Models instead)
# OpenAI API key - now loaded from environment variables

# Supabase Configuration
SUPABASE_URL = "https://whqrjyospvdjsjpujkfd.supabase.co"

# Direct PostgreSQL Connection (Primary Method)
# Updated URL with correct hostname format
# POSTGRES_URL = "postgresql://postgres:You1@db.whqrjyospvdjsjpujkfd.supabase.co:5432/postgres"
POSTGRES_URL = "postgresql://postgres:Q2hszywkvb@1@db.whqrjyospvdjsjpujkfd.supabase.co:5432/postgres"

# Alternative URLs to try if the main one fails
POSTGRES_URL_ALTERNATIVES = [
    "postgresql://postgres:You1@whqrjyospvdjsjpujkfd.supabase.co:5432/postgres",
    "postgresql://postgres:You1@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
]

# For testing data insertion, you can temporarily use service role key
# SUPABASE_SERVICE_KEY = "your_service_role_key_here"  # Uncomment and add your service role key

# To use service role key for testing, uncomment the line below:
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

# NOTE: Now using direct PostgreSQL connection as primary method
# Supabase client kept as fallback for compatibility
# Direct PostgreSQL connection bypasses RLS restrictions and supports full SQL

# Table Schema Definitions for Auto-Detection (Based on EXACT database schemas you created)
TABLE_SCHEMAS = {
    "bank_details": {
        "required_columns": ["TRAN_DATE"],
        "column_types": {
            "ACCOUNT_NO": "integer",
            "TRAN_DATE": "date",
            "TRAN_PARTICULAR": "text",
            "DEBIT_AMOUNT": "numeric",
            "CREDIT_AMOUNT": "numeric",
            "BALANCE_AMOUNT": "numeric"
        },
        "keywords": ["account", "transaction", "debit", "credit", "balance", "bank", "particulars"],
        "column_aliases": {
            "account number": "ACCOUNT_NO",
            "account no": "ACCOUNT_NO",
            "acc no": "ACCOUNT_NO",
            "transaction date": "TRAN_DATE",
            "date": "TRAN_DATE",
            "transaction particular": "TRAN_PARTICULAR",
            "particulars": "TRAN_PARTICULAR",
            "description": "TRAN_PARTICULAR",
            "details": "TRAN_PARTICULAR",
            "narration": "TRAN_PARTICULAR",
            "debit amount": "DEBIT_AMOUNT",
            "debit": "DEBIT_AMOUNT",
            "dr": "DEBIT_AMOUNT",
            "credit amount": "CREDIT_AMOUNT",
            "credit": "CREDIT_AMOUNT",
            "cr": "CREDIT_AMOUNT",
            "balance amount": "BALANCE_AMOUNT",
            "balance": "BALANCE_AMOUNT",
            "bal": "BALANCE_AMOUNT"
        }
    },
    
    "crd": {
        "required_columns": ["a_party", "b_party", "date", "time", "duration", "call_type", 
                           "first_cell_id_a", "last_cell_id_a", "imei_a", "imsi_a", 
                           "first_cell_id_a_address", "latitude", "longitude"],
        "column_types": {
            "a_party": "bigint",
            "b_party": "text",
            "date": "timestamp",
            "time": "time",
            "duration": "integer",
            "call_type": "text",
            "first_cell_id_a": "text",
            "last_cell_id_a": "text", 
            "imei_a": "bigint",
            "imsi_a": "bigint",
            "first_cell_id_a_address": "text",
            "latitude": "numeric",
            "longitude": "numeric"
        },
        "keywords": ["call", "party", "cell", "imei", "imsi", "duration", "cdr", "crd"],
        "column_aliases": {
            "a party": "a_party",
            "b party": "b_party", 
            "call type": "call_type",
            "first cell id a": "first_cell_id_a",
            "last cell id a": "last_cell_id_a",
            "imei a": "imei_a",
            "imsi a": "imsi_a",
            "first cell id a address": "first_cell_id_a_address"
        }
    },
    
    "ipdr": {
        "required_columns": ["landline_msidn_mdn_leased_circuit_id", "user_id", "source_ip_address", 
                           "source_port", "translated_ip_address", "translated_port", 
                           "destination_ip_address", "destination_port", "static_dynamic_ip_address_allocation",
                           "ist_start_time_of_public_ip_allocation", "ist_end_time_of_public_ip_allocation",
                           "start_date_of_public_ip_allocation", "end_date_of_public_ip_allocation",
                           "source_mac_id_address", "imei", "imsi", "pgw_ip_address", 
                           "access_point_name", "first_cell_id", "session_duration",
                           "data_volume_up_link", "data_volume_down_link", "roaming_circle_indicator", "roaming_circle"],
        "column_types": {
            "landline_msidn_mdn_leased_circuit_id": "bigint",
            "user_id": "bigint", 
            "source_ip_address": "inet",
            "source_port": "integer",
            "translated_ip_address": "inet",
            "translated_port": "integer",
            "destination_ip_address": "inet", 
            "destination_port": "integer",
            "static_dynamic_ip_address_allocation": "text",
            "ist_start_time_of_public_ip_allocation": "time",
            "ist_end_time_of_public_ip_allocation": "time",
            "start_date_of_public_ip_allocation": "date",
            "end_date_of_public_ip_allocation": "date",
            "source_mac_id_address": "bigint",
            "imei": "bigint",
            "imsi": "bigint", 
            "pgw_ip_address": "inet",
            "access_point_name": "text",
            "first_cell_id": "text",
            "last_cell_id": "text",
            "session_duration": "integer",
            "data_volume_up_link": "bigint",
            "data_volume_down_link": "bigint",
            "roaming_circle_indicator": "text",
            "roaming_circle": "text",
            "sim_type": "text"
        },
        "keywords": ["ip", "port", "data", "volume", "session", "roaming", "ipdr", "msidn", "pgw", "apn", "landline", "internet", "access"],
        "column_aliases": {
            "landline/msisdn/mdn/leased circuit id for internet access": "landline_msidn_mdn_leased_circuit_id",
            "user id for internet access based on authentication": "user_id",
            "source ip address": "source_ip_address",
            "source port": "source_port",
            "translated ip address": "translated_ip_address",
            "translated port": "translated_port",
            "destination ip address": "destination_ip_address",
            "destination port": "destination_port",
            "static/dynamic ip address allocation": "static_dynamic_ip_address_allocation",
            "ist start time of public ip address allocation (hh:mm:ss)": "ist_start_time_of_public_ip_allocation",
            "ist end time of public ip address allocation (hh:mm:ss)": "ist_end_time_of_public_ip_allocation",
            "start date of public ip address allocation (dd/mm/yyyy)": "start_date_of_public_ip_allocation",
            "end date of public ip address allocation (dd/mm/yyyy)": "end_date_of_public_ip_allocation",
            "source mac-id address/other device identification number": "source_mac_id_address",
            "imei": "imei",
            "imsi": "imsi",
            "pgw ip address": "pgw_ip_address",
            "access point name": "access_point_name",
            "first cell id": "first_cell_id",
            "last cell id": "last_cell_id",
            "session duration": "session_duration",
            "data volume up link": "data_volume_up_link",
            "data volume down link": "data_volume_down_link",
            "roaming circle indicator": "roaming_circle_indicator",
            "roaming circle": "roaming_circle",
            "sim type": "sim_type"
        }
    },
    
    "sms_header": {
        "required_columns": ["header", "principal_entity_name"],
        "column_types": {
            "header": "text",
            "principal_entity_name": "text"
        },
        "keywords": ["sms", "header", "entity", "principal", "message", "text", "sender", "sda"],
        "column_aliases": {
            "sms header": "header",
            "entity name": "principal_entity_name",
            "message": "header",
            "text": "header",
            "content": "header",
            "sender": "principal_entity_name",
            "from": "principal_entity_name",
            "source": "principal_entity_name",
            "sms": "header",
            "sda": "header"
        }
    },
    
    "subscriber": {
        "required_columns": ["phone_number", "subscriber_name", "address"],
        "column_types": {
            "phone_number": "text",
            "alternative_mobile_no": "text",
            "subscriber_name": "text",
            "guardian_name": "text",
            "address": "text",
            "date_of_activation": "date",
            "type_of_connection": "text",
            "service_provider": "text",
            "phone5": "text"
        },
        "keywords": ["phone", "subscriber", "guardian", "activation", "connection", "provider", "mobile"],
        "column_aliases": {
            "phone number": "phone_number",
            "alternative mobile no": "alternative_mobile_no",
            "subscriber name": "subscriber_name",
            "subscirber name": "subscriber_name",  # Common typo in source data
            "guardian name": "guardian_name",
            "address": "address",
            "date of activation": "date_of_activation",
            "type of connection": "type_of_connection",
            "service provider": "service_provider",
            "phone5": "phone5"
        }
    },
    
    "tower_dumps": {
        "required_columns": ["a_party", "b_party", "date", "time", "duration", "call_type",
                           "first_cell_id_a", "last_cell_id_a", "imei_a", "imsi_a", 
                           "first_cell_id_a_address", "roaming_a"],
        "column_types": {
            "a_party": "bigint",
            "b_party": "text", 
            "date": "integer",
            "time": "time",
            "duration": "integer",
            "call_type": "text",
            "first_cell_id_a": "text",
            "last_cell_id_a": "text",
            "imei_a": "bigint", 
            "imsi_a": "bigint",
            "first_cell_id_a_address": "text",
            "roaming_a": "text",
            "latitude": "numeric",
            "longitude": "numeric"
        },
        "keywords": ["tower", "dump", "roaming", "roaming_a"],
        "column_aliases": {
            "a party": "a_party",
            "b party": "b_party",
            "date": "date",
            "time": "time", 
            "duration": "duration",
            "call type": "call_type",
            "first cell id a": "first_cell_id_a",
            "last cell id a": "last_cell_id_a",
            "imei a": "imei_a",
            "imsi a": "imsi_a",
            "first cell id a address": "first_cell_id_a_address",
            "roaming a": "roaming_a",
            "latitude": "latitude",
            "longitude": "longitude"
        }
    },
    
    "true_caller": {
        "required_columns": ["s_no", "number", "name", "network", "address"],
        "column_types": {
            "s_no": "integer",
            "number": "bigint",
            "name": "text", 
            "profession": "text",
            "network": "text",
            "address": "text",
            "spam_score": "numeric",
            "spam_type": "text",
            "image_link": "text",
            "email": "text",
            "gender": "text",
            "type": "text",
            "facebook": "text",
            "twitter": "text", 
            "website": "text",
            "dial_in_code": "integer",
            "country_code": "text",
            "category": "text"
        },
        "keywords": ["caller", "number", "name", "profession", "spam", "truecaller", "s_no", "s.no"],
        "column_aliases": {
            "s.no": "s_no",
            "number": "number",
            "name": "name",
            "profession": "profession",
            "network": "network",
            "address": "address",
            "spam score": "spam_score",
            "spam type": "spam_type",
            "image link": "image_link",
            "email": "email",
            "gender": "gender",
            "type": "type",
            "facebook": "facebook",
            "twitter": "twitter",
            "website": "website",
            "dial-in code": "dial_in_code",
            "country code": "country_code",
            "category": "category"
        }
    }
}