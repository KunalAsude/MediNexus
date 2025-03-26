/**
 * Medical specialty descriptions
 * This file contains descriptions of various medical specialties to provide context
 * for the symptom-to-specialty mapping system
 */

export interface SpecialtyDescription {
    name: string;
    description: string;
    commonConditions: string[];
  }
  
  export const specialtyDescriptions: Record<string, SpecialtyDescription> = {
    "General Physician": {
      name: "General Physician",
      description: "A doctor who provides primary care and treats a wide range of common medical conditions. They are often the first point of contact for patients and can refer to specialists when needed.",
      commonConditions: [
        "Common cold and flu",
        "Fever",
        "Minor infections",
        "Headaches",
        "General health check-ups",
        "Preventive care",
        "Chronic disease management"
      ]
    },
    
    "Neurologist": {
      name: "Neurologist",
      description: "A specialist who diagnoses and treats disorders of the brain, spinal cord, and nervous system.",
      commonConditions: [
        "Headaches and migraines",
        "Epilepsy and seizures",
        "Stroke",
        "Multiple sclerosis",
        "Parkinson's disease",
        "Alzheimer's disease",
        "Neuropathy"
      ]
    },
    
    "Cardiologist": {
      name: "Cardiologist",
      description: "A specialist who diagnoses and treats diseases and conditions of the heart and cardiovascular system.",
      commonConditions: [
        "Heart disease",
        "Heart attacks",
        "Heart failure",
        "Arrhythmias",
        "High blood pressure",
        "High cholesterol",
        "Congenital heart defects"
      ]
    },
    
    "Dermatologist": {
      name: "Dermatologist",
      description: "A specialist who diagnoses and treats conditions affecting the skin, hair, and nails.",
      commonConditions: [
        "Acne",
        "Eczema",
        "Psoriasis",
        "Skin cancer",
        "Rashes",
        "Hair loss",
        "Nail disorders"
      ]
    },
    
    "Orthopedic": {
      name: "Orthopedic Surgeon",
      description: "A specialist who diagnoses and treats disorders and injuries of the musculoskeletal system, including bones, joints, ligaments, tendons, and muscles.",
      commonConditions: [
        "Fractures",
        "Joint pain",
        "Arthritis",
        "Sports injuries",
        "Back and neck pain",
        "Scoliosis",
        "Osteoporosis"
      ]
    },
    
    "Gastroenterologist": {
      name: "Gastroenterologist",
      description: "A specialist who diagnoses and treats disorders of the digestive system, including the esophagus, stomach, intestines, liver, and pancreas.",
      commonConditions: [
        "Acid reflux (GERD)",
        "Irritable bowel syndrome (IBS)",
        "Inflammatory bowel disease (IBD)",
        "Ulcers",
        "Gallstones",
        "Hepatitis",
        "Colon polyps and cancer"
      ]
    },
    
    "ENT Specialist": {
      name: "ENT Specialist (Otolaryngologist)",
      description: "A specialist who diagnoses and treats disorders of the ears, nose, throat, and related structures of the head and neck.",
      commonConditions: [
        "Ear infections",
        "Hearing loss",
        "Tonsillitis",
        "Sinusitis",
        "Allergies",
        "Voice disorders",
        "Sleep apnea"
      ]
    },
    
    "Ophthalmologist": {
      name: "Ophthalmologist",
      description: "A specialist who diagnoses and treats eye disorders and diseases, and can prescribe glasses and contact lenses.",
      commonConditions: [
        "Cataracts",
        "Glaucoma",
        "Macular degeneration",
        "Diabetic retinopathy",
        "Refractive errors",
        "Eye infections",
        "Dry eye syndrome"
      ]
    },
    
    "Urologist": {
      name: "Urologist",
      description: "A specialist who diagnoses and treats disorders of the urinary tract in both men and women, and the reproductive system in men.",
      commonConditions: [
        "Urinary tract infections",
        "Kidney stones",
        "Prostate disorders",
        "Erectile dysfunction",
        "Incontinence",
        "Bladder issues",
        "Testicular conditions"
      ]
    },
    
    "Gynecologist": {
      name: "Gynecologist",
      description: "A specialist who diagnoses and treats disorders of the female reproductive system.",
      commonConditions: [
        "Menstrual disorders",
        "Fertility issues",
        "Pregnancy and childbirth",
        "Menopause",
        "Pelvic pain",
        "Ovarian cysts",
        "Cervical, ovarian, and uterine cancers"
      ]
    },
    
    "Pulmonologist": {
      name: "Pulmonologist",
      description: "A specialist who diagnoses and treats diseases and conditions of the respiratory system, including the lungs and bronchial tubes.",
      commonConditions: [
        "Asthma",
        "Chronic obstructive pulmonary disease (COPD)",
        "Pneumonia",
        "Tuberculosis",
        "Lung cancer",
        "Sleep apnea",
        "Pulmonary fibrosis"
      ]
    },
    
    "Endocrinologist": {
      name: "Endocrinologist",
      description: "A specialist who diagnoses and treats disorders of the endocrine system, which includes the glands that produce hormones.",
      commonConditions: [
        "Diabetes",
        "Thyroid disorders",
        "Adrenal disorders",
        "Pituitary disorders",
        "Osteoporosis",
        "Hormonal imbalances",
        "Growth disorders"
      ]
    },
    
    "Nephrologist": {
      name: "Nephrologist",
      description: "A specialist who diagnoses and treats disorders of the kidneys and renal system.",
      commonConditions: [
        "Chronic kidney disease",
        "Kidney failure",
        "Kidney stones",
        "Glomerulonephritis",
        "Polycystic kidney disease",
        "Hypertension related to kidney disease",
        "Electrolyte disorders"
      ]
    },
    
    "Rheumatologist": {
      name: "Rheumatologist",
      description: "A specialist who diagnoses and treats autoimmune diseases, and disorders of the joints, muscles, and bones.",
      commonConditions: [
        "Rheumatoid arthritis",
        "Osteoarthritis",
        "Lupus",
        "Gout",
        "Fibromyalgia",
        "Scleroderma",
        "Vasculitis"
      ]
    },
    
    "Hematologist": {
      name: "Hematologist",
      description: "A specialist who diagnoses and treats disorders of the blood, bone marrow, and lymphatic system.",
      commonConditions: [
        "Anemia",
        "Leukemia",
        "Lymphoma",
        "Hemophilia",
        "Blood clotting disorders",
        "Sickle cell disease",
        "Multiple myeloma"
      ]
    },
    
    "Oncologist": {
      name: "Oncologist",
      description: "A specialist who diagnoses and treats cancer and provides medical care for cancer patients.",
      commonConditions: [
        "Breast cancer",
        "Lung cancer",
        "Colorectal cancer",
        "Prostate cancer",
        "Leukemia",
        "Lymphoma",
        "Melanoma"
      ]
    },
    
    "Psychiatrist": {
      name: "Psychiatrist",
      description: "A medical doctor who specializes in mental health, including substance use disorders.",
      commonConditions: [
        "Depression",
        "Anxiety disorders",
        "Bipolar disorder",
        "Schizophrenia",
        "Post-traumatic stress disorder (PTSD)",
        "Obsessive-compulsive disorder (OCD)",
        "Substance use disorders"
      ]
    },
    
    "Neurosurgeon": {
      name: "Neurosurgeon",
      description: "A surgeon who specializes in the diagnosis and surgical treatment of disorders of the central and peripheral nervous system.",
      commonConditions: [
        "Brain tumors",
        "Spinal cord injuries",
        "Brain aneurysms",
        "Herniated discs",
        "Spinal stenosis",
        "Traumatic brain injuries",
        "Hydrocephalus"
      ]
    },
    
    "Infectious Disease Specialist": {
      name: "Infectious Disease Specialist",
      description: "A specialist who diagnoses and treats infections caused by bacteria, viruses, fungi, and parasites.",
      commonConditions: [
        "HIV/AIDS",
        "Tuberculosis",
        "Hepatitis",
        "Meningitis",
        "COVID-19",
        "Lyme disease",
        "Tropical diseases"
      ]
    },
    
    "Allergist/Immunologist": {
      name: "Allergist/Immunologist",
      description: "A specialist who diagnoses and treats allergies, asthma, and other disorders of the immune system.",
      commonConditions: [
        "Allergic rhinitis (hay fever)",
        "Food allergies",
        "Drug allergies",
        "Asthma",
        "Eczema",
        "Immune deficiencies",
        "Anaphylaxis"
      ]
    },
    
    "Pediatrician": {
      name: "Pediatrician",
      description: "A specialist who provides medical care for infants, children, and adolescents.",
      commonConditions: [
        "Childhood illnesses",
        "Developmental disorders",
        "Immunizations",
        "Growth and nutrition issues",
        "Behavioral problems",
        "Congenital conditions",
        "Childhood infections"
      ]
    },
    
    "Geriatrician": {
      name: "Geriatrician",
      description: "A specialist who focuses on health care of elderly people, aiming to promote health and treating diseases and disabilities in older adults.",
      commonConditions: [
        "Dementia",
        "Falls and mobility issues",
        "Osteoporosis",
        "Polypharmacy (multiple medication management)",
        "Incontinence",
        "Frailty",
        "Age-related chronic diseases"
      ]
    },
    
    "Plastic Surgeon": {
      name: "Plastic Surgeon",
      description: "A surgeon who specializes in reconstructive and cosmetic procedures to restore, reconstruct, or alter the human body.",
      commonConditions: [
        "Burns",
        "Congenital deformities",
        "Traumatic injuries",
        "Cosmetic enhancements",
        "Breast reconstruction",
        "Scar revision",
        "Hand surgery"
      ]
    },
    
    "Sports Medicine Specialist": {
      name: "Sports Medicine Specialist",
      description: "A specialist who focuses on the treatment and prevention of injuries related to sports and exercise.",
      commonConditions: [
        "Sports injuries",
        "Concussions",
        "Sprains and strains",
        "Stress fractures",
        "Overuse injuries",
        "Exercise-induced asthma",
        "Performance enhancement"
      ]
    },
    
    "Pain Management Specialist": {
      name: "Pain Management Specialist",
      description: "A specialist who helps patients with chronic pain manage their symptoms and improve their quality of life.",
      commonConditions: [
        "Chronic back pain",
        "Neuropathic pain",
        "Fibromyalgia",
        "Complex regional pain syndrome",
        "Cancer pain",
        "Post-surgical pain",
        "Headaches and migraines"
      ]
    },
    
    "Vascular Surgeon": {
      name: "Vascular Surgeon",
      description: "A surgeon who specializes in the diagnosis and treatment of conditions affecting the vascular system (arteries, veins, and lymphatic vessels).",
      commonConditions: [
        "Peripheral artery disease",
        "Varicose veins",
        "Deep vein thrombosis",
        "Aneurysms",
        "Carotid artery disease",
        "Venous insufficiency",
        "Lymphedema"
      ]
    },
    
    "Colorectal Surgeon": {
      name: "Colorectal Surgeon",
      description: "A surgeon who specializes in the diagnosis and treatment of disorders of the colon, rectum, and anus.",
      commonConditions: [
        "Colorectal cancer",
        "Inflammatory bowel disease",
        "Diverticulitis",
        "Hemorrhoids",
        "Anal fissures",
        "Fecal incontinence",
        "Rectal prolapse"
      ]
    },
    
    "Dentist": {
      name: "Dentist",
      description: "A healthcare professional who specializes in the diagnosis, prevention, and treatment of diseases and conditions of the oral cavity.",
      commonConditions: [
        "Tooth decay",
        "Gum disease",
        "Tooth abscess",
        "Dental trauma",
        "Malocclusion",
        "Oral cancer screening",
        "Dental restoration"
      ]
    }
  };
  
  /**
   * Get the description for a specific medical specialty
   * @param specialty - Name of the medical specialty
   * @returns Description object for the specialty or undefined if not found
   */
  export function getSpecialtyDescription(specialty: string): SpecialtyDescription | undefined {
    return specialtyDescriptions[specialty];
  }
  
  /**
   * Get a list of all available medical specialties
   * @returns Array of specialty names
   */
  export function getAllSpecialties(): string[] {
    return Object.keys(specialtyDescriptions);
  }