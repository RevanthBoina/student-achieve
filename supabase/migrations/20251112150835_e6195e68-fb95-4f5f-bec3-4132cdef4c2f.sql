-- Security Fix 1: Add comment length constraint
ALTER TABLE comments 
ADD CONSTRAINT content_length_check 
CHECK (char_length(content) <= 5000);

-- Security Fix 2: Create reaction type ENUM and apply it
CREATE TYPE reaction_type AS ENUM (
  'amazing', 'funny', 'respect', 'inspiring', 'risky', 'unbelievable'
);

ALTER TABLE reactions 
ALTER COLUMN type TYPE reaction_type USING type::reaction_type;

-- Security Fix 3: Add length limits on records table
ALTER TABLE records 
ADD CONSTRAINT title_length_check 
CHECK (char_length(title) <= 200);

ALTER TABLE records 
ADD CONSTRAINT description_length_check 
CHECK (char_length(description) <= 5000);

-- Security Fix 4: Add length limit on profiles bio
ALTER TABLE profiles 
ADD CONSTRAINT bio_length_check 
CHECK (char_length(bio) <= 500);

-- Security Fix 5: Add length limit on profiles school
ALTER TABLE profiles 
ADD CONSTRAINT school_length_check 
CHECK (char_length(school) <= 200);