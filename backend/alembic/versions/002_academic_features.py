"""
002_academic_mandatory_features

Add workspace_settings, password_reset_tokens, and user_sessions tables.
Revision ID: 002_academic_mandatory_features
Revises: 06c83e6b5379
Create Date: 2026-11-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_academic_features'
down_revision = '06c83e6b5379'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── workspace_settings ────────────────────────────────────────────────────
    op.create_table(
        'workspace_settings',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('company_id', sa.Uuid(), nullable=False),
        sa.Column('weekly_digest', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('ai_insights_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('revenue_alerts', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('push_alerts', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('theme', sa.String(10), nullable=False, server_default='dark'),
        sa.Column('language', sa.String(10), nullable=False, server_default='en'),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='Asia/Kolkata'),
        sa.Column('currency', sa.String(5), nullable=False, server_default='INR'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index('ix_workspace_settings_user_id', 'workspace_settings', ['user_id'])
    op.create_index('ix_workspace_settings_company_id', 'workspace_settings', ['company_id'])

    # ── password_reset_tokens ────────────────────────────────────────────────
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('token_hash', sa.String(64), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash'),
    )
    op.create_index('ix_password_reset_tokens_user_id', 'password_reset_tokens', ['user_id'])
    op.create_index('ix_password_reset_tokens_token_hash', 'password_reset_tokens', ['token_hash'])

    # ── user_sessions ──────────────────────────────────────────────────────────
    op.create_table(
        'user_sessions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('company_id', sa.Uuid(), nullable=False),
        sa.Column('jti', sa.String(64), nullable=False),
        sa.Column('device_name', sa.String(200), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_active', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('jti'),
    )
    op.create_index('ix_user_sessions_user_id', 'user_sessions', ['user_id'])
    op.create_index('ix_user_sessions_jti', 'user_sessions', ['jti'])
    op.create_index('ix_user_sessions_is_revoked', 'user_sessions', ['is_revoked'])


def downgrade() -> None:
    op.drop_table('user_sessions')
    op.drop_table('password_reset_tokens')
    op.drop_table('workspace_settings')
