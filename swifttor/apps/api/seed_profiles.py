"""
Seed script to create profiles for existing users
Run this after creating users in the database
"""

import sys
sys.path.append('.')

from db.session import SessionLocal, engine
from models.database import Profile, User, UserRole
from sqlalchemy.orm import Session
import uuid


def create_profile_for_user(user_id: str, role: UserRole, session: Session):
    """Create a profile for an existing user"""
    
    # Check if profile already exists
    existing_profile = session.query(Profile).filter(Profile.user_id == user_id).first()
    if existing_profile:
        print(f"✓ Profile already exists for user {user_id}")
        return existing_profile
    
    # Get user info
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"✗ User not found: {user_id}")
        return None
    
    # Create profile
    profile = Profile(
        user_id=user_id,
        role=role,
        bio=f"{role.value} profile for {user.name}",
        is_active=True,
        last_login=None
    )
    
    session.add(profile)
    session.commit()
    
    print(f"✓ Created {role.value} profile for {user.name} ({user.email})")
    return profile


def seed_profiles():
    """Seed profiles for all existing users"""
    db = SessionLocal()
    
    try:
        # Get all users without profiles
        users_without_profiles = db.query(User).outerjoin(
            Profile, User.id == Profile.user_id
        ).filter(Profile.id.is_(None)).all()
        
        if not users_without_profiles:
            print("No users found without profiles. All users have profiles!")
            return
        
        print(f"\nFound {len(users_without_profiles)} users without profiles\n")
        print("=" * 60)
        
        # Ask user how to assign roles
        print("\nHow should we assign roles?")
        print("1. Assign 'customer' role to all users")
        print("2. Assign roles interactively")
        print("3. Skip (don't create any profiles)")
        
        choice = input("\nEnter choice (1-3): ").strip()
        
        if choice == '1':
            # Assign customer to all
            for user in users_without_profiles:
                create_profile_for_user(str(user.id), UserRole.customer, db)
            print("\n✓ All users assigned 'customer' role")
            
        elif choice == '2':
            # Interactive assignment
            print("\nAvailable roles: customer, driver, shop_owner, admin")
            print("-" * 60)
            
            for i, user in enumerate(users_without_profiles, 1):
                print(f"\n[{i}/{len(users_without_profiles)}] User: {user.name}")
                print(f"    Email: {user.email}")
                print(f"    Phone: {user.phone}")
                
                while True:
                    role_input = input("    Assign role (customer/driver/shop_owner/admin/skip): ").strip().lower()
                    
                    if role_input == 'skip':
                        print("    → Skipped")
                        break
                    elif role_input in ['customer', 'driver', 'shop_owner']:
                        role = UserRole(role_input)
                        create_profile_for_user(str(user.id), role, db)
                        break
                    else:
                        print("    Invalid role. Please try again.")
                        
        elif choice == '3':
            print("\nSkipped profile creation")
            
        else:
            print("\nInvalid choice. Exiting.")
        
        print("\n" + "=" * 60)
        print("Profile seeding complete!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_test_profiles():
    """Create test profiles for demo purposes"""
    db = SessionLocal()
    
    try:
        # Check if test users exist
        test_users = [
            {"email": "customer@test.com", "name": "Test Customer", "phone": "+14155550001"},
            {"email": "driver@test.com", "name": "Test Driver", "phone": "+14155550002"},
            {"email": "shop@test.com", "name": "Test Shop Owner", "phone": "+14155550003"},
        ]
        
        print("\nCreating test profiles...")
        print("=" * 60)
        
        for test_user_data in test_users:
            # Find or create user
            user = db.query(User).filter(User.email == test_user_data["email"]).first()
            
            if not user:
                user = User(
                    name=test_user_data["name"],
                    phone=test_user_data["phone"],
                    email=test_user_data["email"],
                    role=UserRole.customer,  # Default, will be overridden by profile
                    verified=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                print(f"Created user: {user.email}")
            
            # Determine role from email
            if "customer" in test_user_data["email"]:
                role = UserRole.customer
            elif "driver" in test_user_data["email"]:
                role = UserRole.driver
            elif "shop" in test_user_data["email"]:
                role = UserRole.shop_owner
            else:
                role = UserRole.customer
            
            # Create profile
            create_profile_for_user(str(user.id), role, db)
        
        print("\n" + "=" * 60)
        print("✓ Test profiles created successfully!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Seed profiles for existing users")
    parser.add_argument("--test", action="store_true", help="Create test profiles")
    args = parser.parse_args()
    
    if args.test:
        create_test_profiles()
    else:
        seed_profiles()
