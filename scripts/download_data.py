import requests
import pandas as pd
import numpy as np
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_data():
    """Create sample biodiversity data for Poland"""
    
    # Create data directory
    os.makedirs("data", exist_ok=True)
    
    logger.info("Creating sample biodiversity data for Poland...")
    
    # Sample species data
    species_data = {
        'speciesKey': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'scientificName': [
            'Homo sapiens', 'Canis lupus', 'Felis catus', 'Sus scrofa', 'Capreolus capreolus',
            'Lepus europaeus', 'Vulpes vulpes', 'Meles meles', 'Sciurus vulgaris', 'Erinaceus europaeus'
        ],
        'vernacularName': [
            'Human', 'Wolf', 'Cat', 'Wild Boar', 'Roe Deer',
            'European Hare', 'Red Fox', 'European Badger', 'Red Squirrel', 'European Hedgehog'
        ],
        'kingdom': ['Animalia'] * 10,
        'phylum': ['Chordata'] * 10,
        'class': ['Mammalia'] * 10,
        'order': ['Primates', 'Carnivora', 'Carnivora', 'Artiodactyla', 'Artiodactyla',
                 'Lagomorpha', 'Carnivora', 'Carnivora', 'Rodentia', 'Eulipotyphla'],
        'family': ['Hominidae', 'Canidae', 'Felidae', 'Suidae', 'Cervidae',
                  'Leporidae', 'Canidae', 'Mustelidae', 'Sciuridae', 'Erinaceidae'],
        'genus': ['Homo', 'Canis', 'Felis', 'Sus', 'Capreolus',
                 'Lepus', 'Vulpes', 'Meles', 'Sciurus', 'Erinaceus']
    }
    
    # Create observations data
    np.random.seed(42)  # For reproducible data
    n_observations = 1000
    
    observations_data = {
        'speciesKey': np.random.choice(species_data['speciesKey'], n_observations),
        'decimalLatitude': np.random.uniform(49.0, 54.8, n_observations),
        'decimalLongitude': np.random.uniform(14.0, 24.2, n_observations),
        'eventDate': [f"{np.random.randint(2000, 2024)}-{np.random.randint(1, 13):02d}-{np.random.randint(1, 29):02d}" for _ in range(n_observations)],
        'year': np.random.randint(2000, 2024, n_observations),
        'month': np.random.randint(1, 13, n_observations),
        'day': np.random.randint(1, 29, n_observations),
        'country': ['Poland'] * n_observations,
        'stateProvince': np.random.choice(['Mazovia', 'Silesia', 'Greater Poland', 'Lesser Poland', 'Pomerania'], n_observations),
        'locality': [f"Location {i}" for i in range(n_observations)],
        'basisOfRecord': np.random.choice(['HUMAN_OBSERVATION', 'OBSERVATION', 'MACHINE_OBSERVATION'], n_observations),
        'individualCount': np.random.randint(1, 10, n_observations)
    }
    
    # Convert to DataFrames
    species_df = pd.DataFrame(species_data)
    observations_df = pd.DataFrame(observations_data)
    
    logger.info(f"Created {len(species_df)} species and {len(observations_df)} observations")
    
    return species_df, observations_df

def download_gbif_data():
    """Create sample biodiversity data for Poland"""
    
    # Create data directory
    os.makedirs("data", exist_ok=True)
    
    try:
        # Create sample data
        species_df, observations_df = create_sample_data()
        
        # Save observations data
        observations_file = "data/observations_poland.csv"
        observations_df.to_csv(observations_file, index=False)
        logger.info(f"Saved observations to {observations_file}")
        
        # Create species data with observation counts
        logger.info("Creating species dataset...")
        
        # Add observation counts
        species_counts = observations_df.groupby('speciesKey').size().reset_index(name='observationCount')
        species_df = species_df.merge(species_counts, on='speciesKey', how='left')
        
        # Sort by observation count
        species_df = species_df.sort_values('observationCount', ascending=False)
        
        # Save species data
        species_file = "data/species_poland.csv"
        species_df.to_csv(species_file, index=False)
        logger.info(f"Saved species data to {species_file}")
        
        # Print summary statistics
        logger.info("\n=== Data Summary ===")
        logger.info(f"Total observations: {len(observations_df)}")
        logger.info(f"Total species: {len(species_df)}")
        logger.info(f"Year range: {observations_df['year'].min()} - {observations_df['year'].max()}")
        logger.info(f"Top 5 species by observation count:")
        for _, row in species_df.head().iterrows():
            logger.info(f"  {row['scientificName']} ({row['vernacularName']}): {row['observationCount']} observations")
            
    except Exception as e:
        logger.error(f"Error creating sample data: {e}")
        return

if __name__ == "__main__":
    download_gbif_data()
