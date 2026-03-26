"""add_profiles_table

Revision ID: a1b2c3d4e5f6
Revises: 92a14a845309
Create Date: 2026-03-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '92a14a845309'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum type if it doesn't exist (PostgreSQL doesn't support IF NOT EXISTS for ENUMs)
    try:
        op.execute("CREATE TYPE userrole AS ENUM ('customer', 'driver', 'shop_owner')")
    except Exception:
        # Type already exists, skip
        pass
    
    # Create profiles table
    op.create_table('profiles',
        sa.Column('id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.Enum('customer', 'driver', 'shop_owner', name='userrole'), nullable=False),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('bio', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('zip_code', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.Column('emergency_contact_name', sa.String(), nullable=True),
        sa.Column('emergency_contact_phone', sa.String(), nullable=True),
        sa.Column('preferences', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    
    # Create indexes for better query performance
    op.create_index('ix_profiles_user_id', 'profiles', ['user_id'])
    op.create_index('ix_profiles_role', 'profiles', ['role'])
    op.create_index('ix_profiles_is_active', 'profiles', ['is_active'])
    
    # Add foreign key constraint
    op.create_foreign_key(
        'fk_profiles_user_id',
        'profiles', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade() -> None:
    # Drop foreign key constraint
    op.drop_constraint('fk_profiles_user_id', 'profiles', type_='foreignkey')
    
    # Drop indexes
    op.drop_index('ix_profiles_is_active', table_name='profiles')
    op.drop_index('ix_profiles_role', table_name='profiles')
    op.drop_index('ix_profiles_user_id', table_name='profiles')
    
    # Drop profiles table
    op.drop_table('profiles')
