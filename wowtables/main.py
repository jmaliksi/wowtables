import argparse
import csv
import random
from collections import Counter
from typing import Annotated, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, distinct, select
from sqlalchemy.orm import (DeclarativeBase, Mapped, Session, mapped_column,
                            relationship, sessionmaker)

DB_URL = 'sqlite:///./data/tables.db'
engine = create_engine(DB_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI()
origins = [
    'http://localhost:3000',
    'localhost:3000',
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


class Base(DeclarativeBase):
    pass


class Entry(Base):
    __tablename__ = 'entries'
    id: Mapped[int] = mapped_column(primary_key=True)
    table: Mapped[str] = mapped_column(index=True)
    value: Mapped[str]
    weight: Mapped[Optional[float]] = mapped_column(default=1)


class Tag(Base):
    __tablename__ = 'tags'
    id: Mapped[int] = mapped_column(primary_key=True)
    table: Mapped[str]
    name: Mapped[str]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get('/api/roll')
def roll(t: Annotated[List[str] | None, Query()] = None, db: Session = Depends(get_db)):
    if not t:
        raise HTTPException(status_code=400, detail=f'no tables specified')
    q = select(Entry).where(Entry.table.in_(t))
    tables = {}
    for row in db.execute(q).scalars():
        tables.setdefault(row.table, [])
        tables[row.table].append((row.value, row.weight))
    res = {}
    table_reqs = Counter(t)
    for table, n in table_reqs.items():
        if table not in tables:
            raise HTTPException(status_code=400, detail=f'unknown table `{table}`')
        res[table] = random.choices([v[0] for v in tables[table]], weights=[v[1] for v in tables[table]], k=n)
    return res


@app.get('/api/tables')
def tables(db: Session = Depends(get_db)):
    q = select(distinct(Entry.table))
    return db.scalars(q).all()


@app.get('/api/categories')
def categories(db: Session = Depends(get_db)):
    q = select(Tag).order_by(Tag.name)
    res = {}
    for row in db.execute(q).scalars():
        res.setdefault(row.name, [])
        res[row.name].append(row.table)
    return res


def load_data(fn):
    db = SessionLocal()
    try:
        with open(fn, newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                value = row[0]
                table = row[1]
                weight = 1
                entry = Entry(
                    table=row[1],
                    value=row[0],
                )
                if len(row) >= 3 and row[2]:
                    entry.weight = row[2]
                db.add(entry)
            db.commit()
    finally:
        db.close()


def load_tags(fn):
    db = SessionLocal()
    try:
        with open(fn, newline='') as f:
            reader = csv.reader(f)
            for row in reader:
                table = row[0]
                for tag in row[1:]:
                    db.add(Tag(table=table, name=tag))
            db.commit()
    finally:
        db.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['load', 'tag', 'init', 'clear'])
    parser.add_argument('--csv')
    args = parser.parse_args()
    if args.command == 'init':
        Base.metadata.create_all(bind=engine)
    elif args.command == 'load':
        load_data(args.csv)
    elif args.command == 'tag':
        load_tags(args.csv)
    elif args.command == 'clear':
        Base.metadata.drop_all(bind=engine)
