# FILE: backend/routers/populatie.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import SessionLocal
from routers.utils import ok

router = APIRouter(prefix="/populatie", tags=["Populatie"])

# 🔹 Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def get_populatie_summary(db: Session = Depends(get_db)):
    """
    Geeft samenvattende statistieken terug voor de populatie:
    - Aantal patiënten
    - Gemiddelde dagen tussen belangrijke gebeurtenissen
    - Tellingen per categorie (geslacht, sport, arts, …)
    """

    # ----------------------------
    # 1️⃣ Gemiddelden (dagen)
    # ----------------------------
    sql = text("""
        WITH eerste_momenten AS (
            SELECT 
                b.blessure_id,
                b.datum_ongeval,
                b.datum_operatie,
                b.datum_intake,
                m45.lopen_opstartdatum AS lopen_datum,
                w6.autorijden_datum AS autorijden_datum_norm
            FROM blessures b
            LEFT JOIN maand45 m45 ON m45.blessure_id = b.blessure_id
            LEFT JOIN week6  w6  ON w6.blessure_id  = b.blessure_id
            LEFT JOIN maand3 m3  ON m3.blessure_id  = b.blessure_id
        )
        SELECT
            (SELECT COUNT(DISTINCT p.patient_id) FROM patienten p) AS total_patients,
            AVG(CASE WHEN datum_ongeval IS NOT NULL AND datum_operatie IS NOT NULL 
                      AND DATEDIFF(datum_operatie, datum_ongeval) > 0
                     THEN DATEDIFF(datum_operatie, datum_ongeval) END) AS avg_days_accident_to_surgery,
            AVG(CASE WHEN datum_operatie IS NOT NULL AND datum_intake IS NOT NULL
                      AND DATEDIFF(datum_intake, datum_operatie) > 0
                     THEN DATEDIFF(datum_intake, datum_operatie) END) AS avg_days_surgery_to_intake,
            AVG(CASE WHEN datum_operatie IS NOT NULL AND lopen_datum IS NOT NULL
                      AND DATEDIFF(lopen_datum, datum_operatie) > 0
                     THEN DATEDIFF(lopen_datum, datum_operatie) END) AS avg_days_surgery_to_walk,
            AVG(CASE WHEN datum_operatie IS NOT NULL 
                      AND autorijden_datum_norm IS NOT NULL
                      AND autorijden_datum_norm <> '9999-12-31'
                      AND DATEDIFF(autorijden_datum_norm, datum_operatie) > 0
                     THEN DATEDIFF(autorijden_datum_norm, datum_operatie) END) AS avg_days_surgery_to_drive
        FROM eerste_momenten;
    """)
    kpi = dict(db.execute(sql).mappings().first())

    # ----------------------------
    # 2️⃣ Tellingen per categorie
    # ----------------------------
    def count_query(table, field):
        """
        Telt waarden in een kolom en berekent het percentage binnen de geldige rijen.
        NULL- en lege waarden worden uitgesloten.
        """
        q = text(f"""
            SELECT 
                {field} AS name,
                COUNT(*) AS value,
                ROUND(
                    COUNT(*) * 100.0 /
                    (SELECT COUNT(*) FROM {table} WHERE {field} IS NOT NULL AND {field} <> ''),
                    1
                ) AS percent
            FROM {table}
            WHERE {field} IS NOT NULL AND {field} <> ''
            GROUP BY {field}
            ORDER BY percent DESC;  -- 🔹 aangepaste sortering
        """)
        return [dict(r) for r in db.execute(q).mappings().all()]

    # 🔸 Categorieën ophalen
    geslacht    = count_query("patienten", "geslacht")
    sport       = count_query("blessures", "sport")
    sportniveau = count_query("blessures", "sportniveau")
    etiologie   = count_query("blessures", "etiologie")
    operatie    = count_query("blessures", "operatie")
    arts        = count_query("blessures", "arts")
    letsel      = count_query("blessures", "bijkomende_letsels")
    monoloop    = count_query("blessures", "monoloop")

    ok("[POPULATIE] Summary samengesteld")

    # ----------------------------
    # 3️⃣ Response
    # ----------------------------
    return {
        "totalPatients": kpi.get("total_patients"),
        "avg": {
            "accident_to_surgery": kpi.get("avg_days_accident_to_surgery"),
            "surgery_to_intake":   kpi.get("avg_days_surgery_to_intake"),
            "surgery_to_walk":     kpi.get("avg_days_surgery_to_walk"),
            "surgery_to_drive":    kpi.get("avg_days_surgery_to_drive"),
        },
        "counts": {
            "geslacht":    geslacht,
            "sport":       sport,
            "sportniveau": sportniveau,
            "etiologie":   etiologie,
            "operatie":    operatie,
            "arts":        arts,
            "letsel":      letsel,
            "monoloop":    monoloop,
        }
    }

# -----------------------------------------------------
# INDIVIDUEEL PER ATLEET
# -----------------------------------------------------
@router.get("/{blessure_id}")
def get_populatie_individueel(blessure_id: int, db: Session = Depends(get_db)):
    """
    Geeft samenvattende statistieken terug voor één blessure (i.p.v. populatie).
    """
    sql = text(f"""
        SELECT 
            b.blessure_id,
            b.patient_id,
            p.naam,
            b.zijde,
            b.sport,
            b.sportniveau,
            b.etiologie,
            b.operatie,
            b.arts,
            b.monoloop,
            b.datum_ongeval,
            b.datum_operatie,
            b.datum_intake
        FROM blessures b
        LEFT JOIN patienten p ON p.patient_id = b.patient_id
        WHERE b.blessure_id = :bid;
    """)
    info = dict(db.execute(sql, {"bid": blessure_id}).mappings().first() or {})

    if not info:
        return {"error": "Blessure niet gevonden"}

    return {
        "blessure": blessure_id,
        "patient_id": info.get("patient_id"),
        "naam": info.get("naam"),
        "sport": info.get("sport"),
        "sportniveau": info.get("sportniveau"),
        "etiologie": info.get("etiologie"),
        "operatie": info.get("operatie"),
        "arts": info.get("arts"),
        "monoloop": info.get("monoloop"),
        "datum_ongeval": info.get("datum_ongeval"),
        "datum_operatie": info.get("datum_operatie"),
        "datum_intake": info.get("datum_intake"),
        "zijde": info.get("zijde"),
    }
