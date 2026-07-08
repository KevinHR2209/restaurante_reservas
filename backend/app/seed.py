from sqlalchemy.orm import Session
from .models.mesa import Mesa
from .models.mozo import Mozo
from .models.horario_mozo import HorarioMozo
from .models.plato import Plato


def run_seed(db: Session):
    # Mesas
    if db.query(Mesa).count() == 0:
        mesas_data = [
            dict(numero=1,  capacidad=2,  zona="interior"),
            dict(numero=2,  capacidad=2,  zona="interior"),
            dict(numero=3,  capacidad=4,  zona="interior"),
            dict(numero=4,  capacidad=4,  zona="interior"),
            dict(numero=5,  capacidad=6,  zona="interior"),
            dict(numero=6,  capacidad=6,  zona="terraza"),
            dict(numero=7,  capacidad=4,  zona="terraza"),
            dict(numero=8,  capacidad=4,  zona="terraza"),
            dict(numero=9,  capacidad=2,  zona="barra"),
            dict(numero=10, capacidad=2,  zona="barra"),
        ]
        for md in mesas_data:
            db.add(Mesa(**md, activa=True))
        db.commit()

    # Mozos
    if db.query(Mozo).count() == 0:
        mozos_data = [
            dict(nombre='Catalína',  apellido='Morales',  email='catalina.morales@restaurante.cl',  telefono='+56911111001'),
            dict(nombre='Rodrigo',    apellido='Leal',      email='rodrigo.leal@restaurante.cl',      telefono='+56911111002'),
            dict(nombre='Valentina',  apellido='Soto',      email='valentina.soto@restaurante.cl',    telefono='+56911111003'),
            dict(nombre='Andrés',     apellido='Pizarro',   email='andres.pizarro@restaurante.cl',    telefono='+56911111004'),
        ]
        for md in mozos_data:
            db.add(Mozo(**md, activo=True))
        db.commit()

    # Horarios Martes(1) a Domingo(6) de 12:00 a 23:00
    if db.query(HorarioMozo).count() == 0:
        mozos = db.query(Mozo).all()
        for m in mozos:
            for dia in range(1, 7):  # martes a domingo
                db.add(HorarioMozo(
                    mozo_id=m.id,
                    dia_semana=dia,
                    hora_inicio='12:00:00',
                    hora_fin='23:00:00',
                ))
        db.commit()

    # Platos
    if db.query(Plato).count() == 0:
        platos_data = [
            # Entradas
            dict(nombre='Ceviche de Corvina',       descripcion='Corvina marinada en limón con cebolla morada y cilantro.',         categoria='entrada',    precio=7500),
            dict(nombre='Tabla de Quesos',          descripcion='Selección de quesos artesanales con mermelada y galletas.',         categoria='entrada',    precio=9000),
            dict(nombre='Empanadas Fritas (3 und)', descripcion='Empanadas de pino caseras fritas, servidas con pebre.',             categoria='entrada',    precio=5500),
            dict(nombre='Sopa de la Abuela',        descripcion='Sopa de pollo con verduras de temporada y fideos.',                 categoria='entrada',    precio=4500),
            # Fondos
            dict(nombre='Filete a la Plancha',      descripcion='Filete de res 200g con puré rústico y ensalada del huerto.',       categoria='fondo',      precio=14500),
            dict(nombre='Salmón en Salsa de Eneldo',descripcion='Salmón al horno con salsa de eneldo, arroz y vegetales salteados.',categoria='fondo',      precio=13000),
            dict(nombre='Pollo Mediterráneo',       descripcion='Pechuga de pollo rellena con tomates secos y albahaca fresca.',    categoria='fondo',      precio=11000),
            dict(nombre='Pastel de Choclo',         descripcion='Clásico pastel de choclo con pino de vacuno y aceituna.',           categoria='fondo',      precio=9500),
            dict(nombre='Risotto de Champiñones',   descripcion='Risotto cremoso con champiñones portobello y parmesano rallado.',  categoria='fondo',      precio=10500),
            # Postres
            dict(nombre='Crème Brûlée',            descripcion='Clásica crème brûlée con corteza de azúcar caramelizada.',         categoria='postre',     precio=5000),
            dict(nombre='Torta de Chocolate',       descripcion='Torta húmeda de chocolate con ganache y frutos rojos.',            categoria='postre',     precio=4500),
            dict(nombre='Helado Artesanal (2 bochas)',descripcion='Selección de dos sabores de helado artesanal con coulis.',       categoria='postre',     precio=3500),
            # Bebestibles
            dict(nombre='Jugo Natural (vaso)',      descripcion='Jugo de fruta natural del día. Consultar sabores disponibles.',    categoria='bebestible', precio=2500),
            dict(nombre='Copa de Vino Tinto',       descripcion='Copa de vino tinto de la casa, Valle del Maule.',                   categoria='bebestible', precio=3800),
            dict(nombre='Agua Mineral 500ml',       descripcion='Agua mineral con o sin gas.',                                       categoria='bebestible', precio=1500),
            dict(nombre='Café Especial',            descripcion='Café de especialidad preparado en método pour-over o espresso.',   categoria='bebestible', precio=3000),
        ]
        for pd in platos_data:
            db.add(Plato(**pd, activo=True))
        db.commit()
