export interface SeedExercise {
  name: string;
  muscleGroups: string[];
  secondaryMuscles: string[];
  equipment: string[];
  mediaUrl: string;
  formCues: string[];
  substitutionTags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const EXERCISE_CATALOG: SeedExercise[] = [
  // ==================== CHEST ====================
  {
    name: 'Barbell Bench Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Plant feet flat on floor', 'Retract and depress shoulder blades', 'Lower bar with control to mid-chest', 'Press up while driving through heels'],
    substitutionTags: ['horizontal_press', 'chest_compound', 'barbell_chest'],
    difficulty: 'intermediate'
  },
  {
    name: 'Incline Barbell Bench Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Front Delts', 'Triceps'],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Set bench angle to 30 degrees', 'Keep wrists straight and forearms vertical', 'Touch upper chest smoothly', 'Press back up in vertical bar path'],
    substitutionTags: ['horizontal_press', 'upper_chest', 'chest_compound'],
    difficulty: 'intermediate'
  },
  {
    name: 'Flat Dumbbell Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Kick weights back smoothly onto bench', 'Elbows tucked at roughly 45-75 degrees', 'Press dumbbells up in a gentle arc', 'Full stretch at the bottom without over-dropping'],
    substitutionTags: ['horizontal_press', 'chest_compound', 'dumbbell_chest'],
    difficulty: 'beginner'
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Set bench to 30-45 degrees', 'Retract scapulae throughout', 'Press up firmly and squeeze upper chest', 'Slow 3-second descent'],
    substitutionTags: ['horizontal_press', 'upper_chest', 'dumbbell_chest'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Chest Flyes',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Front Delts'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Maintain slight bend in elbows', 'Open arms wide until chest stretches', 'Hug a tree motion to return', 'Do not overextend shoulder capsule'],
    substitutionTags: ['chest_isolation', 'dumbbell_chest'],
    difficulty: 'intermediate'
  },
  {
    name: 'Cable Crossover (High to Low)',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Lower Chest', 'Front Delts'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Staggered stance for balance', 'Pull handles down and across front of hips', 'Squeeze lower chest tightly for 1 second', 'Control the return stretch'],
    substitutionTags: ['chest_isolation', 'cable_chest', 'lower_chest'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Flyes (Low to High)',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Upper Chest', 'Front Delts'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Set pulleys at bottom pins', 'Scoop handles upward toward chin level', 'Focus tension on clavicular pectoralis', 'Maintain upright torso with soft knees'],
    substitutionTags: ['chest_isolation', 'upper_chest', 'cable_chest'],
    difficulty: 'intermediate'
  },
  {
    name: 'Machine Chest Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Adjust seat so handles align with mid-chest', 'Keep back flat against pad', 'Press handle out to near lockout', 'Resist the return stack'],
    substitutionTags: ['horizontal_press', 'chest_compound', 'machine_chest'],
    difficulty: 'beginner'
  },
  {
    name: 'Pec Deck Machine Flyes',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Front Delts'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Sit tall with back supported', 'Elbows slightly bent and aligned with chest', 'Bring pads together and hold contraction', 'Slow 2-second negative'],
    substitutionTags: ['chest_isolation', 'machine_chest'],
    difficulty: 'beginner'
  },
  {
    name: 'Standard Push-ups',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Core', 'Front Delts'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Hands slightly wider than shoulders', 'Core and glutes tightly braced in straight plank', 'Lower chest to 1 inch from ground', 'Push ground away powerfully'],
    substitutionTags: ['horizontal_press', 'bodyweight_chest', 'pushup'],
    difficulty: 'beginner'
  },
  {
    name: 'Decline Push-ups (Feet Elevated)',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Upper Chest', 'Triceps', 'Front Delts'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Place toes on bench or chair', 'Keep body in rigid plank alignment', 'Lower controlled until chest touches ground', 'Press upward through upper chest'],
    substitutionTags: ['horizontal_press', 'upper_chest', 'bodyweight_chest'],
    difficulty: 'intermediate'
  },
  {
    name: 'Chest Dips',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Lean torso forward 30 degrees', 'Flared elbows slightly outside wrists', 'Lower until upper arms are parallel to floor', 'Drive through palms to lockout'],
    substitutionTags: ['horizontal_press', 'lower_chest', 'bodyweight_chest', 'dip'],
    difficulty: 'advanced'
  },
  {
    name: 'Resistance Band Chest Press',
    muscleGroups: ['Chest'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Anchor band behind back or pole', 'Press handles forward to full extension', 'Squeeze pecs at peak contraction', 'Control band tension on return'],
    substitutionTags: ['horizontal_press', 'band_chest'],
    difficulty: 'beginner'
  },

  // ==================== BACK ====================
  {
    name: 'Conventional Barbell Deadlift',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Traps', 'Core'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Stand with midfoot under bar', 'Hinge down and grip bar outside legs', 'Pull chest proud, engage lats', 'Push floor away through heels and lockout hips'],
    substitutionTags: ['hip_hinge', 'posterior_chain', 'back_compound', 'deadlift'],
    difficulty: 'advanced'
  },
  {
    name: 'Barbell Bent-Over Row',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Core'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Hinge at hips to roughly 45-degree angle', 'Flat back with core braced', 'Pull barbell smoothly towards lower ribcage', 'Squeeze shoulder blades together at top'],
    substitutionTags: ['horizontal_pull', 'back_compound', 'barbell_back'],
    difficulty: 'intermediate'
  },
  {
    name: 'Single-Arm Dumbbell Row',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['One knee and hand resting firmly on bench', 'Keep back flat and parallel to floor', 'Pull dumbbell up toward hip bone', 'Lower to full lat stretch without rotating hips'],
    substitutionTags: ['horizontal_pull', 'back_compound', 'dumbbell_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Lat Pulldown (Wide Grip)',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    equipment: ['Cables', 'Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Grip bar slightly wider than shoulders', 'Lean torso back 10-15 degrees', 'Pull bar down towards upper chest', 'Slowly extend arms back up for full stretch'],
    substitutionTags: ['vertical_pull', 'lat_compound', 'cable_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Lat Pulldown (Close Neutral Grip)',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Lower Lats'],
    equipment: ['Cables', 'Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Attach V-bar or neutral handles', 'Drive elbows straight down towards sides', 'Squeeze lats tight at collarbone', 'Control ascent back to stretch'],
    substitutionTags: ['vertical_pull', 'lat_compound', 'cable_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Seated Cable Row',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Middle Traps', 'Rhomboids'],
    equipment: ['Cables', 'Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Sit upright with soft bend in knees', 'Do not swing torso excessively', 'Pull handle toward belly button', 'Pinch shoulder blades tightly together'],
    substitutionTags: ['horizontal_pull', 'back_compound', 'cable_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Chest-Supported T-Bar Row',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Rear Delts', 'Biceps'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Press upper chest flat on pad to remove lower back strain', 'Grab handles with palms neutral or overhand', 'Row elbows back past torso', 'Pause for 1 second at top'],
    substitutionTags: ['horizontal_pull', 'back_compound', 'machine_back'],
    difficulty: 'intermediate'
  },
  {
    name: 'Standard Pull-ups',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms', 'Core'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Overhand grip slightly wider than shoulders', 'Start from dead hang with active shoulders', 'Pull chest up until chin clears bar', 'Lower under full control'],
    substitutionTags: ['vertical_pull', 'lat_compound', 'bodyweight_back', 'pullup'],
    difficulty: 'advanced'
  },
  {
    name: 'Chin-ups (Underhand Grip)',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Forearms'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Palms facing toward you at shoulder width', 'Pull up smoothly focusing on bicep and lat power', 'Touch upper chest to bar', 'Control descent to full lockout'],
    substitutionTags: ['vertical_pull', 'biceps_compound', 'bodyweight_back'],
    difficulty: 'intermediate'
  },
  {
    name: 'Inverted Row (Bodyweight)',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Lie under barbell or TRX at hip height', 'Keep heels on floor and body in rigid line', 'Pull chest up to bar', 'Lower smoothly without sagging hips'],
    substitutionTags: ['horizontal_pull', 'bodyweight_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Straight-Arm Cable Pulldown',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Core', 'Rear Delts'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Stand with slight forward hip hinge', 'Keep elbows extended with soft lock', 'Push bar down in an arc to thighs', 'Feel isolation purely in latissimus dorsi'],
    substitutionTags: ['lat_isolation', 'cable_back'],
    difficulty: 'beginner'
  },
  {
    name: 'Resistance Band Rows',
    muscleGroups: ['Back'],
    secondaryMuscles: ['Biceps', 'Rhomboids'],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Loop band around feet while seated on floor', 'Pull elbows back tight against ribs', 'Hold peak contraction for 1 second', 'Slowly extend arms against band tension'],
    substitutionTags: ['horizontal_pull', 'band_back'],
    difficulty: 'beginner'
  },

  // ==================== SHOULDERS ====================
  {
    name: 'Standing Overhead Barbell Press (OHP)',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Core'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Grip bar just outside shoulders', 'Squeeze glutes and brace abdominal wall', 'Press bar vertically overhead', 'Push head through at lockout'],
    substitutionTags: ['vertical_press', 'shoulder_compound', 'barbell_shoulder'],
    difficulty: 'advanced'
  },
  {
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Upper Chest'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Set bench straight up at 80-90 degrees', 'Start dumbbells at ear height with neutral or flared wrists', 'Press up in a smooth arch', 'Do not clank dumbbells together'],
    substitutionTags: ['vertical_press', 'shoulder_compound', 'dumbbell_shoulder'],
    difficulty: 'intermediate'
  },
  {
    name: 'Arnold Dumbbell Press',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Front Delts'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Start with palms facing chest like top of curl', 'Rotate palms outward as you press overhead', 'Reverse rotation on way down', 'Fluid and controlled tempo'],
    substitutionTags: ['vertical_press', 'shoulder_compound', 'dumbbell_shoulder'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Lateral Raises',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Slight forward lean with soft knees', 'Lead upward with elbows not hands', 'Raise out to sides until parallel to floor', 'Slow 2-second negative without swinging'],
    substitutionTags: ['lateral_delts', 'shoulder_isolation', 'dumbbell_shoulder'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Lateral Raises',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Set pulley to hip height or lowest pin', 'Raise handle across body out to shoulder height', 'Constant tension throughout entire range of motion', 'Avoid shrugging neck'],
    substitutionTags: ['lateral_delts', 'shoulder_isolation', 'cable_shoulder'],
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Front Raises',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Upper Chest'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Hold dumbbells across thighs with overhand grip', 'Raise one or both arms straight out in front', 'Stop at eye level', 'Lower with control'],
    substitutionTags: ['front_delts', 'shoulder_isolation', 'dumbbell_shoulder'],
    difficulty: 'beginner'
  },
  {
    name: 'Dumbbell Rear Delt Flyes',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Upper Back', 'Rhomboids'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Bend forward at hips until chest is parallel to ground', 'Raise dumbbells out to sides squeezing rear delts', 'Keep pinkies turned slightly upward', 'Do not arch lower back'],
    substitutionTags: ['rear_delts', 'shoulder_isolation', 'dumbbell_shoulder'],
    difficulty: 'intermediate'
  },
  {
    name: 'Cable Face Pulls',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Rear Delts', 'Rotator Cuff', 'Upper Back'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Attach rope to eye-level pulley', 'Pull rope handles toward eye level with thumbs back', 'Rotate external rotators at peak', 'Excellent for shoulder longevity'],
    substitutionTags: ['rear_delts', 'rotator_cuff', 'cable_shoulder'],
    difficulty: 'beginner'
  },
  {
    name: 'Barbell Upright Row',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Traps', 'Biceps'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Grip bar shoulder-width apart', 'Pull barbell vertically up to chest level', 'Lead upward with elbows high', 'Lower slowly'],
    substitutionTags: ['lateral_delts', 'shoulder_compound', 'barbell_shoulder'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Shrugs',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Upper Traps'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Hold heavy dumbbells at sides', 'Elevate shoulders directly toward ears', 'Hold peak contraction for 1 second', 'Never roll shoulders forward or backward'],
    substitutionTags: ['traps', 'shoulder_isolation'],
    difficulty: 'beginner'
  },
  {
    name: 'Pike Push-ups',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Triceps', 'Core'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Push hips up high into an inverted V shape', 'Lower head diagonally forward between hands', 'Push through shoulders to return', 'Bodyweight overhead press alternative'],
    substitutionTags: ['vertical_press', 'bodyweight_shoulder'],
    difficulty: 'intermediate'
  },
  {
    name: 'Resistance Band Lateral Raises',
    muscleGroups: ['Shoulders'],
    secondaryMuscles: ['Traps'],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Stand on middle of band with one foot', 'Raise arms out to sides to parallel', 'Control the descent', 'Great for home workouts'],
    substitutionTags: ['lateral_delts', 'band_shoulder'],
    difficulty: 'beginner'
  },

  // ==================== LEGS (QUADS, HAMSTRINGS, CALVES) ====================
  {
    name: 'Barbell Back Squat',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Rest bar securely across upper traps', 'Feet shoulder-width apart with toes out 15-30 degrees', 'Squat down until hip crease is below knee', 'Drive through midfoot to stand tall'],
    substitutionTags: ['quad_compound', 'knee_flexion', 'squat', 'barbell_legs'],
    difficulty: 'advanced'
  },
  {
    name: 'Barbell Front Squat',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Core', 'Upper Back'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Clean grip or cross-arm rack with high elbows', 'Keep torso completely vertical', 'Deep squat with knees tracking toes', 'Great quad emphasis with low spine shear'],
    substitutionTags: ['quad_compound', 'knee_flexion', 'squat', 'front_squat'],
    difficulty: 'advanced'
  },
  {
    name: 'Goblet Squat (Dumbbell/Kettlebell)',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Hold dumbbell vertical against chest like a goblet', 'Feet shoulder-width apart', 'Sit between hips down to parallel', 'Drive up while keeping chest proud'],
    substitutionTags: ['quad_compound', 'knee_flexion', 'squat', 'dumbbell_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Leg Press Machine',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Sit firmly with lower back pressed against backpad', 'Feet shoulder-width on sled', 'Lower sled until knees reach 90 degrees', 'Press back up without locking knees hard'],
    substitutionTags: ['quad_compound', 'machine_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Hack Squat Machine',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Back flat on carriage pad with shoulders locked in', 'Lower until deep knee bend', 'Push up through balls and mid-foot of feet', 'Isolates quadriceps with minimal balance demand'],
    substitutionTags: ['quad_compound', 'machine_legs'],
    difficulty: 'intermediate'
  },
  {
    name: 'Walking Dumbbell Lunges',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Calves'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Step forward smoothly', 'Lower back knee gently toward ground', 'Drive through front heel into next step', 'Maintain tall upright posture'],
    substitutionTags: ['unilateral_legs', 'quad_compound', 'lunge'],
    difficulty: 'intermediate'
  },
  {
    name: 'Bulgarian Split Squat',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Rear foot laces flat on bench', 'Descend front hip down into deep split squat', 'Keep front knee stacked over front foot', 'Unilateral quad and glute builder'],
    substitutionTags: ['unilateral_legs', 'quad_compound', 'split_squat'],
    difficulty: 'intermediate'
  },
  {
    name: 'Romanian Deadlift (Barbell RDL)',
    muscleGroups: ['Hamstrings'],
    secondaryMuscles: ['Glutes', 'Lower Back'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Soft bend in knees that stays fixed', 'Push hips back toward the wall behind you', 'Lower bar along shins until hamstrings stretch', 'Snap hips forward to lockout'],
    substitutionTags: ['hip_hinge', 'hamstring_compound', 'rdl', 'barbell_legs'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    muscleGroups: ['Hamstrings'],
    secondaryMuscles: ['Glutes', 'Lower Back'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Hold dumbbells close to thighs', 'Hinge backward at hips', 'Keep chest tall and spine rigid', 'Drive through heels to stand'],
    substitutionTags: ['hip_hinge', 'hamstring_compound', 'rdl', 'dumbbell_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Leg Extension Machine',
    muscleGroups: ['Quads'],
    secondaryMuscles: [],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Align knee joint with machine pivot axis', 'Kick roller up to full leg extension', 'Hold peak contraction for 1 second', 'Lower with control'],
    substitutionTags: ['quad_isolation', 'machine_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Lying Leg Curl Machine',
    muscleGroups: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Lie flat with roller resting on lower calf', 'Keep hips pressed into pad', 'Curl heels toward glutes', 'Lower slowly resisting the weight stack'],
    substitutionTags: ['hamstring_isolation', 'machine_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Seated Leg Curl Machine',
    muscleGroups: ['Hamstrings'],
    secondaryMuscles: ['Calves'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Thigh pad clamped tightly down on quads', 'Curl heels downward and back under seat', 'Focus on deep hamstring contraction', 'Smooth return without slamming plates'],
    substitutionTags: ['hamstring_isolation', 'machine_legs'],
    difficulty: 'beginner'
  },
  {
    name: 'Standing Calf Raises',
    muscleGroups: ['Calves'],
    secondaryMuscles: [],
    equipment: ['Machine', 'Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Balls of feet on edge of block', 'Lower heels for full calf stretch (2 seconds)', 'Rise high onto big toes', 'Hold peak squeeze at top'],
    substitutionTags: ['calf_isolation'],
    difficulty: 'beginner'
  },
  {
    name: 'Bodyweight Air Squats',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Feet shoulder-width apart', 'Arms extended forward for balance', 'Squat down to parallel depth', 'Stand tall and squeeze glutes'],
    substitutionTags: ['quad_compound', 'bodyweight_legs', 'squat'],
    difficulty: 'beginner'
  },
  {
    name: 'Step-Ups (Dumbbells/Bodyweight)',
    muscleGroups: ['Quads'],
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Place entire foot on box or bench', 'Drive through top heel without bouncing off back foot', 'Stand fully upright on box', 'Step down with control'],
    substitutionTags: ['unilateral_legs', 'quad_compound'],
    difficulty: 'beginner'
  },

  // ==================== GLUTES & HIPS ====================
  {
    name: 'Barbell Hip Thrust',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core'],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Upper back against bench pad', 'Barbell padded across hip crease', 'Drive through heels, extending hips to horizontal table position', 'Posterior pelvic tilt squeeze at top'],
    substitutionTags: ['glute_compound', 'hip_thrust', 'barbell_glutes'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Hip Thrust',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hamstrings'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Hold dumbbell across hips', 'Drive hips upward into full extension', 'Keep chin tucked looking forward', 'Lower under control'],
    substitutionTags: ['glute_compound', 'hip_thrust', 'dumbbell_glutes'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Glute Kickbacks',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hamstrings'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Ankle strap attached to low pulley', 'Kick leg directly backward squeezing gluteus maximus', 'Do not hyperextend lower back', 'Control the return stroke'],
    substitutionTags: ['glute_isolation', 'cable_glutes'],
    difficulty: 'beginner'
  },
  {
    name: 'Glute Bridge (Floor Bodyweight)',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Hamstrings'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    formCues: ['Lie on back with knees bent at 90 degrees', 'Push through heels to raise hips to ceiling', 'Squeeze glutes hard at peak', 'Lower without completely resting'],
    substitutionTags: ['glute_compound', 'bodyweight_glutes'],
    difficulty: 'beginner'
  },
  {
    name: 'Resistance Band Lateral Monster Walks',
    muscleGroups: ['Glutes'],
    secondaryMuscles: ['Abductors'],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Place band around ankles or above knees', 'Assume quarter-squat athletic stance', 'Step laterally with tension maintained', 'Builds gluteus medius and hip stability'],
    substitutionTags: ['glute_isolation', 'band_glutes'],
    difficulty: 'beginner'
  },

  // ==================== ARMS (BICEPS & TRICEPS) ====================
  {
    name: 'Standing Barbell Bicep Curl',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Barbell'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Underhand grip shoulder-width apart', 'Elbows pinned to sides of ribs', 'Curl bar up toward collarbone', 'Resist on way down without swinging hips'],
    substitutionTags: ['bicep_curl', 'bicep_isolation', 'barbell_arms'],
    difficulty: 'intermediate'
  },
  {
    name: 'Standing Dumbbell Bicep Curl',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Start with palms facing thighs', 'Rotate palms upward (supinate) as you curl', 'Squeeze biceps at top', 'Lower under control'],
    substitutionTags: ['bicep_curl', 'bicep_isolation', 'dumbbell_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Incline Dumbbell Curl',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Bench at 45-60 degree incline', 'Arms hang straight down behind torso for deep long-head stretch', 'Curl up without throwing elbows forward', 'Superb bicep peak builder'],
    substitutionTags: ['bicep_curl', 'bicep_isolation', 'dumbbell_arms'],
    difficulty: 'intermediate'
  },
  {
    name: 'Dumbbell Hammer Curls',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: ['Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Palms face each other throughout movement (neutral grip)', 'Curl dumbbells straight up like swinging a hammer', 'Builds arm thickness and forearm grip', 'Control the descent'],
    substitutionTags: ['bicep_curl', 'brachialis', 'dumbbell_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Cable Bicep Curls',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Attach straight or EZ bar to low pulley', 'Maintain elbows stationary', 'Curl up toward chin', 'Continuous tension through entire arc'],
    substitutionTags: ['bicep_curl', 'cable_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Preacher Curl (EZ Bar / Dumbbells)',
    muscleGroups: ['Biceps'],
    secondaryMuscles: [],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Armpits resting snugly on preacher pad', 'Full arm extension at bottom', 'Curl up squeezing short head of bicep', 'Eliminates all shoulder momentum'],
    substitutionTags: ['bicep_isolation', 'bicep_curl'],
    difficulty: 'intermediate'
  },
  {
    name: 'Tricep Rope Pushdown',
    muscleGroups: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Elbows pinned to sides of torso', 'Push rope down, spreading tips apart at lockout', 'Squeeze lateral tricep head', 'Return to 90 degrees with control'],
    substitutionTags: ['tricep_pushdown', 'tricep_isolation', 'cable_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Straight-Bar Tricep Pushdown',
    muscleGroups: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Overhand grip shoulder-width', 'Press down powerfully to full lockout', 'Squeeze triceps for 1 second', 'Allow forearms to rise to parallel'],
    substitutionTags: ['tricep_pushdown', 'tricep_isolation', 'cable_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Skull Crushers (Lying Tricep Extension)',
    muscleGroups: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Lie flat holding EZ bar over chest', 'Hinge at elbows lowering bar toward forehead or crown', 'Keep elbows pointed up at ceiling', 'Extend forearms back to lockout'],
    substitutionTags: ['tricep_extension', 'tricep_isolation', 'barbell_arms'],
    difficulty: 'intermediate'
  },
  {
    name: 'Overhead Dumbbell Tricep Extension',
    muscleGroups: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Dumbbells', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Hold one heavy dumbbell overhead with diamond grip', 'Lower weight behind head into deep tricep stretch', 'Press back up to overhead lockout', 'Targets long head of triceps'],
    substitutionTags: ['tricep_extension', 'overhead_tricep', 'dumbbell_arms'],
    difficulty: 'intermediate'
  },
  {
    name: 'Close-Grip Barbell Bench Press',
    muscleGroups: ['Triceps'],
    secondaryMuscles: ['Chest', 'Front Delts'],
    equipment: ['Barbell', 'Bench'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Hands shoulder-width apart (do not go excessively narrow)', 'Keep elbows tucked tightly to sides', 'Lower to lower sternum', 'Press up driving through triceps'],
    substitutionTags: ['horizontal_press', 'tricep_compound', 'barbell_arms'],
    difficulty: 'intermediate'
  },
  {
    name: 'Tricep Bench Dips',
    muscleGroups: ['Triceps'],
    secondaryMuscles: ['Front Delts'],
    equipment: ['Bench', 'Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Hands on edge of bench with fingers forward', 'Legs extended straight out on floor', 'Lower hips down keeping back close to bench', 'Push up through palms to lockout'],
    substitutionTags: ['tricep_compound', 'bodyweight_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Diamond Push-ups',
    muscleGroups: ['Triceps'],
    secondaryMuscles: ['Chest', 'Core'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Thumbs and index fingers touching in diamond shape under center of chest', 'Lower chest to hands', 'Press floor away locking out triceps', 'Intense bodyweight arm builder'],
    substitutionTags: ['horizontal_press', 'tricep_compound', 'bodyweight_arms'],
    difficulty: 'advanced'
  },
  {
    name: 'Resistance Band Bicep Curls',
    muscleGroups: ['Biceps'],
    secondaryMuscles: ['Forearms'],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    formCues: ['Stand on band with both feet', 'Curl handles toward shoulders', 'Squeeze biceps against increasing band tension', 'Lower with control'],
    substitutionTags: ['bicep_curl', 'band_arms'],
    difficulty: 'beginner'
  },
  {
    name: 'Resistance Band Tricep Pushdowns',
    muscleGroups: ['Triceps'],
    secondaryMuscles: [],
    equipment: ['Bands'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    formCues: ['Anchor band high on door or bar', 'Push handles down to full extension', 'Squeeze triceps at peak', 'Controlled release back to 90 degrees'],
    substitutionTags: ['tricep_pushdown', 'band_arms'],
    difficulty: 'beginner'
  },

  // ==================== CORE / ABS ====================
  {
    name: 'Hanging Leg Raises',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Hip Flexors', 'Grip'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Hang from pull-up bar with straight arms', 'Engage core and raise legs straight out to 90 degrees or bar', 'Avoid swinging using abdominal power', 'Lower under 3-second control'],
    substitutionTags: ['core_hanging', 'lower_abs', 'bodyweight_core'],
    difficulty: 'advanced'
  },
  {
    name: 'Captain’s Chair Knee Raises',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Hip Flexors'],
    equipment: ['Machine'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Forearms rested on pads with back against cushion', 'Bring knees up smoothly toward chest', 'Curl pelvis upward at top', 'Lower without swinging'],
    substitutionTags: ['lower_abs', 'core_machine'],
    difficulty: 'beginner'
  },
  {
    name: 'Standard Abdominal Plank',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Shoulders', 'Glutes'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Forearms on floor under shoulders', 'Body in straight horizontal plank', 'Pull belly button to spine, squeeze glutes', 'Breathe steadily without hip sagging'],
    substitutionTags: ['isometric_core', 'bodyweight_core'],
    difficulty: 'beginner'
  },
  {
    name: 'Side Plank',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Obliques', 'Glute Medius'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Rest on one forearm with feet stacked', 'Raise hips until body forms straight diagonal', 'Hold position tightly engaging obliques', 'Repeat for both sides'],
    substitutionTags: ['obliques', 'isometric_core', 'bodyweight_core'],
    difficulty: 'intermediate'
  },
  {
    name: 'Cable Woodchoppers',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Obliques', 'Shoulders'],
    equipment: ['Cables'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    formCues: ['Set pulley high and grip handle with both hands', 'Rotate torso down and across body past opposite knee', 'Pivot back foot smoothly', 'Control the return rotation'],
    substitutionTags: ['rotational_core', 'obliques', 'cable_core'],
    difficulty: 'intermediate'
  },
  {
    name: 'Ab Wheel Rollout',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Lats', 'Shoulders'],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Kneel on pad holding ab wheel', 'Roll forward keeping core hollow and back rounded', 'Extend out as far as strength allows', 'Pull back using abdominals not hip flexors'],
    substitutionTags: ['anti_extension', 'bodyweight_core'],
    difficulty: 'advanced'
  },
  {
    name: 'Russian Twists',
    muscleGroups: ['Core'],
    secondaryMuscles: ['Obliques'],
    equipment: ['Bodyweight', 'Dumbbells'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Sit on floor with knees bent and feet elevated', 'Lean back 45 degrees', 'Rotate torso side to side touching dumbbell to floor', 'Keep core braced continuously'],
    substitutionTags: ['rotational_core', 'obliques'],
    difficulty: 'beginner'
  },
  {
    name: 'Dead Bug',
    muscleGroups: ['Core'],
    secondaryMuscles: [],
    equipment: ['Bodyweight'],
    mediaUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    formCues: ['Lie flat on back with knees and arms up', 'Press lower back firmly into floor', 'Extend opposite arm and leg simultaneously', 'Return to center and switch sides'],
    substitutionTags: ['anti_extension', 'bodyweight_core'],
    difficulty: 'beginner'
  }
];
