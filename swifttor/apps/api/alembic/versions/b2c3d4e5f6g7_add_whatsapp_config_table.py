"""add_whatsapp_config_table

Revision ID: b2c3d4e5f6g7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-26 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = 'b2c3d4e5f6g7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create whatsapp_config table
    op.create_table(
        'whatsapp_config',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=sa.text('uuid_generate_v4()')),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('country_code', sa.String(), default='+1'),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('webhook_url', sa.String(), nullable=True),
        sa.Column('api_token', sa.String(), nullable=True),
        sa.Column('message_templates', sa.String(), nullable=True),
        sa.Column('auto_reply_enabled', sa.Boolean(), default=False),
        sa.Column('business_hours_start', sa.String(), nullable=True),
        sa.Column('business_hours_end', sa.String(), nullable=True),
        sa.Column('timezone', sa.String(), default='UTC'),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Create index on is_active for quick lookups
    op.create_index('ix_whatsapp_config_is_active', 'whatsapp_config', ['is_active'])
    op.create_index('ix_whatsapp_config_created_at', 'whatsapp_config', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_whatsapp_config_created_at')
    op.drop_index('ix_whatsapp_config_is_active')
    op.drop_table('whatsapp_config')
