/**
 * Comprehensive Symptom Analyzer
 * This file provides advanced symptom analysis functions that combine all symptom mappings
 * and specialty descriptions to provide accurate doctor recommendations
 */

import { symptomToSpecialtyMapping, SymptomMapping } from './symptomMapping';
import { advancedSymptomToSpecialtyMapping, getCombinedSymptomMapping } from './advancedSymptomMapping';
import { specialtyDescriptions, getSpecialtyDescription } from './specialtyDescriptions';

export interface SymptomAnalysisResult {
  specialty: string;
  confidence: number;
  description?: string;
  commonConditions?: string[];
  matchedSymptoms: string[];
  alternativeSpecialties?: {
    name: string;
    confidence: number;
  }[];
}

/**
 * Advanced symptom analyzer that provides detailed analysis with confidence scores
 * @param symptoms - String containing patient's symptoms
 * @returns Detailed analysis result with primary and alternative specialties
 */
export function analyzeSymptoms(symptoms: string): SymptomAnalysisResult {
  const lowerSymptoms = symptoms.toLowerCase();
  const combinedMapping = getCombinedSymptomMapping();
  
  // Track matched symptoms and their specialties
  const matches: Record<string, string[]> = {};
  
  // First, check for direct matches of common phrases
  const directMatches = [
    "restless leg syndrome",
    "sleep apnea",
    "migraine",
    "back pain",
    "chest pain",
    "heart attack",
    "stroke"
  ];
  
  for (const phrase of directMatches) {
    if (lowerSymptoms.includes(phrase)) {
      const specialty = combinedMapping[phrase];
      if (specialty) {
        if (!matches[specialty]) {
          matches[specialty] = [];
        }
        matches[specialty].push(phrase);
        // Give high priority to these direct matches
        if (matches[specialty].length === 1) {
          // If this is the first match for this specialty, add it twice to increase its weight
          matches[specialty].push(phrase);
        }
      }
    }
  }
  
  // Find all matching symptoms with improved matching algorithm
  for (const [symptom, specialty] of Object.entries(combinedMapping)) {
    // Skip symptoms we've already checked in directMatches
    if (directMatches.includes(symptom)) continue;
    
    // Check for exact matches (surrounded by word boundaries)
    try {
      const exactRegex = new RegExp(`\\b${symptom.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (exactRegex.test(lowerSymptoms)) {
        if (!matches[specialty]) {
          matches[specialty] = [];
        }
        matches[specialty].push(symptom);
        continue; // Skip to next symptom after finding exact match
      }
    } catch (e) {
      // If regex fails (e.g., due to invalid characters), fall back to includes
      if (lowerSymptoms.includes(symptom)) {
        if (!matches[specialty]) {
          matches[specialty] = [];
        }
        matches[specialty].push(symptom);
        continue;
      }
    }
    
    // Check for partial matches for symptoms longer than 5 characters
    if (symptom.length > 5 && lowerSymptoms.includes(symptom)) {
      if (!matches[specialty]) {
        matches[specialty] = [];
      }
      matches[specialty].push(symptom);
    }
  }
  
  // Default to General Physician if no matches
  if (Object.keys(matches).length === 0) {
    return {
      specialty: "General Physician",
      confidence: 0.5,
      description: specialtyDescriptions["General Physician"]?.description,
      commonConditions: specialtyDescriptions["General Physician"]?.commonConditions,
      matchedSymptoms: []
    };
  }
  
  // Calculate confidence scores based on number and quality of symptom matches
  const specialtyScores = Object.entries(matches).map(([specialty, symptoms]) => {
    // Base confidence on number of matched symptoms and their specificity
    const matchCount = symptoms.length;
    const specificityFactor = symptoms.reduce((acc, symptom) => acc + (symptom.length / 10), 0); // Longer symptoms are more specific
    
    // Calculate weighted confidence score
    const baseConfidence = (matchCount * 0.15) + (specificityFactor * 0.05);
    const maxConfidence = 0.95; // Cap at 95% confidence
    
    return {
      name: specialty,
      confidence: Math.min(baseConfidence, maxConfidence),
      matchedSymptoms: symptoms
    };
  }).sort((a, b) => b.confidence - a.confidence);
  
  // Get primary specialty (highest confidence)
  const primarySpecialty = specialtyScores[0];
  
  // Get alternative specialties (next 2 highest, if available)
  const alternativeSpecialties = specialtyScores.slice(1, 3).map(spec => ({
    name: spec.name,
    confidence: spec.confidence
  }));
  
  // Get specialty description
  const specialtyInfo = getSpecialtyDescription(primarySpecialty.name);
  
  return {
    specialty: primarySpecialty.name,
    confidence: primarySpecialty.confidence,
    description: specialtyInfo?.description,
    commonConditions: specialtyInfo?.commonConditions,
    matchedSymptoms: primarySpecialty.matchedSymptoms,
    alternativeSpecialties: alternativeSpecialties.length > 0 ? alternativeSpecialties : undefined
  };
}

/**
 * Simple symptom analyzer that returns just the specialty name (for backward compatibility)
 * @param symptoms - String containing patient's symptoms
 * @returns The most appropriate medical specialty name
 */
export function findSpecialty(symptoms: string): string {
  const result = analyzeSymptoms(symptoms);
  return result.specialty;
}

/**
 * Get a list of symptoms associated with a specific specialty
 * @param specialty - Name of the medical specialty
 * @returns Array of symptoms associated with the specialty
 */
export function getSymptomsBySpecialty(specialty: string): string[] {
  const combinedMapping = getCombinedSymptomMapping();
  const symptoms: string[] = [];
  
  for (const [symptom, mappedSpecialty] of Object.entries(combinedMapping)) {
    if (mappedSpecialty === specialty) {
      symptoms.push(symptom);
    }
  }
  
  return symptoms;
}

/**
 * Search for symptoms that match a partial string
 * @param partialSymptom - Partial symptom text to search for
 * @returns Array of matching symptoms
 */
export function searchSymptoms(partialSymptom: string): string[] {
  const combinedMapping = getCombinedSymptomMapping();
  const lowerPartial = partialSymptom.toLowerCase();
  
  return Object.keys(combinedMapping).filter(symptom => 
    symptom.includes(lowerPartial)
  ).sort();
}