from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
import json
import os
from datetime import datetime
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for data
species_data = None
observations_data = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load biodiversity data on startup"""
    global species_data, observations_data
    
    try:
        # Load species data
        species_file = "data/species_poland.csv"
        if os.path.exists(species_file):
            species_data = pd.read_csv(species_file)
            logger.info(f"Loaded {len(species_data)} species records")
        else:
            logger.warning("Species data file not found")
            
        # Load observations data
        obs_file = "data/observations_poland.csv"
        if os.path.exists(obs_file):
            observations_data = pd.read_csv(obs_file)
            logger.info(f"Loaded {len(observations_data)} observation records")
        else:
            logger.warning("Observations data file not found")
            
    except Exception as e:
        logger.error(f"Error loading data: {e}")
    
    yield
    
    # Cleanup code here if needed

app = FastAPI(title="Biodiversity Dashboard API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Biodiversity Dashboard API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/species/search")
async def search_species(
    query: str = Query(..., description="Search term for species name"),
    limit: int = Query(10, description="Maximum number of results")
):
    """Search for species by vernacular or scientific name"""
    if species_data is None:
        raise HTTPException(status_code=500, detail="Species data not loaded")
    
    try:
        # Search in both vernacular and scientific names
        query_lower = query.lower()
        
        # Create search mask
        vernacular_mask = species_data['vernacularName'].str.lower().str.contains(query_lower, na=False)
        scientific_mask = species_data['scientificName'].str.lower().str.contains(query_lower, na=False)
        
        # Combine masks
        search_mask = vernacular_mask | scientific_mask
        
        # Get results
        results = species_data[search_mask].head(limit)
        
        # Convert to list of dictionaries
        species_list = []
        for _, row in results.iterrows():
            species_list.append({
                "scientificName": row['scientificName'],
                "vernacularName": row['vernacularName'],
                "speciesKey": row['speciesKey'],
                "kingdom": row.get('kingdom', ''),
                "phylum": row.get('phylum', ''),
                "class": row.get('class', ''),
                "order": row.get('order', ''),
                "family": row.get('family', ''),
                "genus": row.get('genus', '')
            })
        
        return {
            "query": query,
            "count": len(species_list),
            "species": species_list
        }
        
    except Exception as e:
        logger.error(f"Error searching species: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching species: {str(e)}")

@app.get("/api/species/{species_key}/observations")
async def get_species_observations(species_key: int):
    """Get observations for a specific species"""
    if observations_data is None:
        raise HTTPException(status_code=500, detail="Observations data not loaded")
    
    try:
        # Filter observations for the species
        species_obs = observations_data[observations_data['speciesKey'] == species_key].copy()
        
        if species_obs.empty:
            return {
                "speciesKey": species_key,
                "count": 0,
                "observations": []
            }
        
        # Convert to list of dictionaries
        observations_list = []
        for _, row in species_obs.iterrows():
            obs = {
                "decimalLatitude": float(row['decimalLatitude']) if pd.notna(row['decimalLatitude']) else None,
                "decimalLongitude": float(row['decimalLongitude']) if pd.notna(row['decimalLongitude']) else None,
                "eventDate": row['eventDate'] if pd.notna(row['eventDate']) else None,
                "year": int(row['year']) if pd.notna(row['year']) else None,
                "month": int(row['month']) if pd.notna(row['month']) else None,
                "day": int(row['day']) if pd.notna(row['day']) else None,
                "country": row.get('country', ''),
                "stateProvince": row.get('stateProvince', ''),
                "locality": row.get('locality', ''),
                "basisOfRecord": row.get('basisOfRecord', ''),
                "individualCount": int(row['individualCount']) if pd.notna(row['individualCount']) else None
            }
            observations_list.append(obs)
        
        return {
            "speciesKey": species_key,
            "count": len(observations_list),
            "observations": observations_list
        }
        
    except Exception as e:
        logger.error(f"Error getting species observations: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting species observations: {str(e)}")

@app.get("/api/species/{species_key}/timeline")
async def get_species_timeline(species_key: int):
    """Get timeline data for a specific species"""
    if observations_data is None:
        raise HTTPException(status_code=500, detail="Observations data not loaded")
    
    try:
        # Filter observations for the species
        species_obs = observations_data[observations_data['speciesKey'] == species_key].copy()
        
        if species_obs.empty:
            return {
                "speciesKey": species_key,
                "timeline": []
            }
        
        # Group by year and count observations
        timeline_data = species_obs.groupby('year').size().reset_index(name='count')
        timeline_data = timeline_data.sort_values('year')
        
        # Convert to list of dictionaries
        timeline = []
        for _, row in timeline_data.iterrows():
            timeline.append({
                "year": int(row['year']),
                "count": int(row['count'])
            })
        
        return {
            "speciesKey": species_key,
            "timeline": timeline
        }
        
    except Exception as e:
        logger.error(f"Error getting species timeline: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting species timeline: {str(e)}")

@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get general statistics for the dashboard"""
    if species_data is None or observations_data is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    try:
        # Basic statistics
        total_species = len(species_data)
        total_observations = len(observations_data)
        
        # Most observed species
        top_species = observations_data.groupby('speciesKey').size().sort_values(ascending=False).head(10)
        top_species_list = []
        
        for species_key, count in top_species.items():
            species_info = species_data[species_data['speciesKey'] == species_key]
            if not species_info.empty:
                species_row = species_info.iloc[0]
                top_species_list.append({
                    "speciesKey": int(species_key),
                    "scientificName": species_row['scientificName'],
                    "vernacularName": species_row['vernacularName'],
                    "observationCount": int(count)
                })
        
        # Year range
        year_range = {
            "min": int(observations_data['year'].min()) if not observations_data['year'].isna().all() else None,
            "max": int(observations_data['year'].max()) if not observations_data['year'].isna().all() else None
        }
        
        return {
            "totalSpecies": total_species,
            "totalObservations": total_observations,
            "topSpecies": top_species_list,
            "yearRange": year_range
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting dashboard stats: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
