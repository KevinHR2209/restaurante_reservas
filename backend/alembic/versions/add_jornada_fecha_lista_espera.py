"""add jornada and fecha_reserva to lista_espera

Revision ID: a1b2c3d4e5f6
Revises: 
Create Date: 2026-07-10
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Agregar columnas nuevas a lista_espera
    with op.batch_alter_table('lista_espera') as batch_op:
        batch_op.add_column(sa.Column('fecha_reserva', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('jornada', sa.Enum('manana', 'tarde', 'noche', name='jornadaespera'), nullable=True))

def downgrade():
    with op.batch_alter_table('lista_espera') as batch_op:
        batch_op.drop_column('jornada')
        batch_op.drop_column('fecha_reserva')
