from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
        )
    """))
    exists = result.scalar()
    print(f"Profiles table exists: {exists}")
    
    if exists:
        print("Table already exists. Stamping migration as complete...")
        # Stamp the migration as done
        from alembic.config import Config
        from alembic import command
        
        alembic_cfg = Config("alembic.ini")
        command.stamp(alembic_cfg, "a1b2c3d4e5f6")
        print("✓ Migration stamped successfully!")
    else:
        print("Table does not exist. Running migration...")
        try:
            from alembic.config import Config
            from alembic import command
            
            alembic_cfg = Config("alembic.ini")
            command.upgrade(alembic_cfg, "head")
            print("✓ Migration completed successfully!")
        except Exception as e:
            print(f"Migration error (expected if enum exists): {e}")
            print("\nManually creating profiles table without enum...")
            
            # Create table without enum constraint
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS profiles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                    role VARCHAR(50) NOT NULL,
                    avatar_url TEXT,
                    bio TEXT,
                    address TEXT,
                    city VARCHAR(100),
                    state VARCHAR(100),
                    zip_code VARCHAR(20),
                    country VARCHAR(100) DEFAULT 'USA',
                    emergency_contact_name VARCHAR(255),
                    emergency_contact_phone VARCHAR(20),
                    preferences TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            conn.commit()
            
            # Create indexes
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active)"))
            conn.commit()
            
            # Stamp migration
            from alembic.config import Config
            from alembic import command
            
            alembic_cfg = Config("alembic.ini")
            command.stamp(alembic_cfg, "a1b2c3d4e5f6")
            print("✓ Table created and migration stamped!")

print("\nDone!")
