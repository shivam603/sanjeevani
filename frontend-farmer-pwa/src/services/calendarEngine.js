/**
 * Personalized Crop Lifecycle Calendar Engine (Client-Side & Offline PWA Service)
 * Generates agronomic timelines based on:
 * Field + Crop + Sowing Date + Growth Stage
 *
 * Timings are explicitly labeled as Approximate / Estimated.
 * Statuses: UPCOMING, TODAY, COMPLETED, OVERDUE.
 */

export const CROP_TEMPLATES = {
  wheat: [
    {
      stage: 'Sowing & Seed Treatment',
      dayOffset: 0,
      title: 'Seed Priming & Basal Sowing',
      actionType: 'sowing',
      icon: '🌱',
      notes: 'Treated with Trichoderma viride @ 4g/kg seed. Applied basal DAP @ 55 kg/acre.',
    },
    {
      stage: 'Crown Root Initiation (CRI)',
      dayOffset: 22,
      title: '1st Critical Crown Root Irrigation',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Ensure light, uniform irrigation. Critical for root anchoring and tillering density.',
    },
    {
      stage: 'Vegetative & Tillering',
      dayOffset: 40,
      title: 'Weed Scouting & Nitrogen Top-Dressing',
      actionType: 'monitoring',
      icon: '🔍',
      notes: 'Scout for broadleaf phalaris minor. Broadcast 1st split Urea @ 45 kg/acre.',
    },
    {
      stage: 'Jointing & Stem Elongation',
      dayOffset: 65,
      title: '2nd Irrigation & Micro-Nutrient Check',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Irrigate according to soil moisture. Inspect for zinc or sulfur deficiency.',
    },
    {
      stage: 'Booting & Heading',
      dayOffset: 85,
      title: 'Disease & Yellow Rust Inspection',
      actionType: 'disease_monitoring',
      icon: '🦠',
      notes: 'Examine flag leaves for yellow stripe rust pustules. Keep bio-fungicide ready.',
    },
    {
      stage: 'Grain Filling & Milking',
      dayOffset: 105,
      title: 'Terminal Heat Protection & Light Watering',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Apply light evening irrigation to moderate canopy temperature during afternoon heat.',
    },
    {
      stage: 'Physiological Maturity & Harvest',
      dayOffset: 130,
      title: 'Grain Hardness Test & Combine Harvest',
      actionType: 'harvest',
      icon: '🌾',
      notes: 'Harvest when grain moisture drops below 12%. Check local APMC mandi arrivals.',
    },
  ],
  mustard: [
    {
      stage: 'Sowing & Soil Prep',
      dayOffset: 0,
      title: 'Basal Sowing & Gypsum Incorporation',
      actionType: 'sowing',
      icon: '🌱',
      notes: 'Seed drilled at 4-5 cm depth with sulfur replenishment.',
    },
    {
      stage: 'Germination & Thinning',
      dayOffset: 18,
      title: 'Thinning & Inter-Plant Spacing',
      actionType: 'monitoring',
      icon: '🌱',
      notes: 'Maintain 12-15 cm between plants for maximum branching potential.',
    },
    {
      stage: 'Vegetative & Branching',
      dayOffset: 35,
      title: 'Pre-Flowering Hoeing & 1st Irrigation',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Light watering prior to flowering onset. Remove emerging weeds.',
    },
    {
      stage: 'Flowering & Pod Initiation',
      dayOffset: 55,
      title: 'Mustard Aphid Field Scouting',
      actionType: 'disease_monitoring',
      icon: '🔍',
      notes: 'Inspect central inflorescence twigs for aphid colonies. Apply neem oil if needed.',
    },
    {
      stage: 'Pod Filling (Siliqua)',
      dayOffset: 75,
      title: 'Pod Moisture Watering & Frost Watch',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Crucial moisture stage for seed oil synthesis and pod enlargement.',
    },
    {
      stage: 'Maturity & Harvest',
      dayOffset: 115,
      title: 'Morning Harvest & Sun Curing',
      actionType: 'harvest',
      icon: '🌾',
      notes: 'Harvest in early morning dew to prevent pod shattering. Sun dry for 4-5 days.',
    },
  ],
  rice: [
    {
      stage: 'Nursery & Puddling',
      dayOffset: 0,
      title: 'Wet Nursery Sowing & Field Puddling',
      actionType: 'sowing',
      icon: '🌱',
      notes: 'Prepare level puddled field with zinc sulfate basal dress.',
    },
    {
      stage: 'Transplantation',
      dayOffset: 25,
      title: 'Seedling Transplantation',
      actionType: 'sowing',
      icon: '🌱',
      notes: 'Transplant 2-3 seedlings per hill at 20x15 cm spacing in standing water.',
    },
    {
      stage: 'Active Tillering',
      dayOffset: 45,
      title: 'Water Standing & Urea Top-Dress',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Maintain 2-3 cm water level; broadcast 1st split Urea.',
    },
    {
      stage: 'Panicle Initiation',
      dayOffset: 70,
      title: 'Stem Borer & Leaf Folder Trapping',
      actionType: 'disease_monitoring',
      icon: '🔍',
      notes: 'Install pheromone lures; apply MOP (potash) for stem vigor.',
    },
    {
      stage: 'Flowering & Heading',
      dayOffset: 90,
      title: 'Bacterial Blight Scouting & Aeration',
      actionType: 'monitoring',
      icon: '🦠',
      notes: 'Inspect for water-soaked leaf streaks. Temporary mid-season drainage.',
    },
    {
      stage: 'Grain Filling & Milking',
      dayOffset: 105,
      title: 'Terminal Field Drainage',
      actionType: 'irrigation',
      icon: '💧',
      notes: 'Drain standing water 10-12 days before anticipated harvest.',
    },
    {
      stage: 'Harvest & Threshing',
      dayOffset: 125,
      title: 'Grain Moisture Check & Threshing',
      actionType: 'harvest',
      icon: '🌾',
      notes: 'Harvest when 80-85% of panicles turn golden yellow.',
    },
  ],
};

export function getCropKey(cropName = '') {
  const c = String(cropName).toLowerCase();
  if (c.includes('wheat') || c.includes('gehun')) return 'wheat';
  if (c.includes('mustard') || c.includes('sarson') || c.includes('raya')) return 'mustard';
  if (c.includes('rice') || c.includes('paddy') || c.includes('dhan')) return 'rice';
  return 'wheat';
}

/**
 * Generate Crop Schedule based on crop and sowing date
 */
export function generateCropSchedule({
  crop = 'Wheat (HD 3086)',
  sowingDateStr = null,
  fieldName = 'Field A (Plot #184/A)',
  currentStage = 'Grain Filling',
  referenceDate = null,
}) {
  const today = referenceDate ? new Date(referenceDate) : new Date();
  today.setHours(0, 0, 0, 0);

  let sowingDate;
  if (sowingDateStr) {
    sowingDate = new Date(sowingDateStr);
  } else {
    // Default 95 days ago for current Rabi grain filling
    sowingDate = new Date(today.getTime() - 95 * 24 * 60 * 60 * 1000);
  }
  sowingDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - sowingDate.getTime();
  const daysAfterSowing = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  const cropKey = getCropKey(crop);
  const template = CROP_TEMPLATES[cropKey] || CROP_TEMPLATES.wheat;

  const activities = [];
  let nextActivity = null;

  template.forEach((item, idx) => {
    const targetDate = new Date(sowingDate.getTime() + item.dayOffset * 24 * 60 * 60 * 1000);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status = 'UPCOMING';
    if (diffDays < -3) {
      status = 'COMPLETED';
    } else if (diffDays >= -3 && diffDays < 0) {
      status = 'OVERDUE';
    } else if (diffDays === 0) {
      status = 'TODAY';
    } else {
      status = 'UPCOMING';
    }

    let dueLabel = '';
    if (diffDays === 0) dueLabel = 'Due Today';
    else if (diffDays === 1) dueLabel = 'Due Tomorrow';
    else if (diffDays > 1) dueLabel = `Due in ${diffDays} days`;
    else if (diffDays === -1) dueLabel = '1 day overdue';
    else dueLabel = `${Math.abs(diffDays)} days overdue`;

    const formattedDate = targetDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const act = {
      id: `act_${cropKey}_${idx}`,
      activity_name: item.title,
      approximate_date: `Estimated: ${formattedDate}`,
      raw_date: targetDate.toISOString().split('T')[0],
      due_label: dueLabel,
      crop_stage: item.stage,
      status: status,
      notes: item.notes,
      icon: item.icon,
      days_after_sowing: item.dayOffset,
      is_completed: status === 'COMPLETED',
      completed_at: status === 'COMPLETED' ? targetDate.toISOString() : null,
    };

    activities.push(act);

    if (!nextActivity && (status === 'TODAY' || status === 'UPCOMING' || status === 'OVERDUE')) {
      nextActivity = act;
    }
  });

  if (!nextActivity && activities.length > 0) {
    nextActivity = activities[activities.length - 1];
  }

  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
  const progressPct = Math.round((completedCount / Math.max(1, activities.length)) * 100);

  return {
    status: 'success',
    crop,
    field_name: fieldName,
    sowing_date: sowingDate.toISOString().split('T')[0],
    sowing_date_formatted: sowingDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    days_after_sowing: daysAfterSowing,
    current_stage: currentStage,
    progress_percentage: progressPct,
    total_activities: activities.length,
    completed_count: completedCount,
    next_activity: nextActivity,
    activities,
    disclaimer: 'Agricultural schedule timings are approximate and estimated based on phenological heat units. Field timing may vary with microclimate conditions.',
  };
}

/**
 * Storage Helpers
 */
export function getCalendarStorageKey(userId = 'default', fieldId = 'field-184a') {
  return `sanjeevani_crop_calendar_${userId}_${fieldId}`;
}

export function loadSavedCalendar(userId, fieldId) {
  try {
    const key = getCalendarStorageKey(userId, fieldId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function saveCalendarToStorage(userId, fieldId, calendarData) {
  try {
    const key = getCalendarStorageKey(userId, fieldId);
    localStorage.setItem(key, JSON.stringify(calendarData));
  } catch (e) {
    console.warn('Failed to save crop calendar:', e);
  }
}
