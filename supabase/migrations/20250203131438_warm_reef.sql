/*
  # Create comments table for design standards

  1. New Tables
    - `comments`
      - `id` (bigint, primary key)
      - `section_id` (text, required)
      - `content` (text, required)
      - `user_email` (text, required)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for:
      - Anyone can read comments
      - Authenticated users can create comments
      - Users can only update/delete their own comments
*/

CREATE TABLE comments (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  section_id text NOT NULL,
  content text NOT NULL,
  user_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own comments
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);