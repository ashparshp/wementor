INSERT INTO users (id, name, email, password_hash, role, email_verified, avatar_url) VALUES 
('11111111-1111-1111-1111-111111111111', 'Dr. Alice Smith', 'alice.mentor@example.com', 'dummyhash', 'mentor', true, 'https://i.pravatar.cc/150?u=alice'),
('22222222-2222-2222-2222-222222222222', 'Bob Johnson', 'bob.mentor@example.com', 'dummyhash', 'mentor', true, 'https://i.pravatar.cc/150?u=bob')
ON CONFLICT (email) DO NOTHING;

INSERT INTO mentor_profiles (user_id, bio, achievements, avg_rating, total_reviews, total_sessions) VALUES
('11111111-1111-1111-1111-111111111111', 'Expert in cracking JEE and NEET exams with 10+ years of experience.', '{"Top 100 JEE Rank", "PhD in Physics"}', 4.9, 120, 300),
('22222222-2222-2222-2222-222222222222', 'Helping students secure top tier software engineering placements at FAANG.', '{"Ex-Google SWE", "GSoc 2020 Mentor"}', 4.8, 85, 200)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO mentorship_plans (id, mentor_id, title, description, category, price_paise, duration_minutes, status) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'JEE Advanced Strategy Session', 'One hour session discussing physics strategy and roadmap for JEE Advanced.', 'jee', 50000, 60, 'approved'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'NEET Biology Crash Review', 'Comprehensive review of difficult biology topics.', 'neet', 30000, 45, 'approved'),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Mock Interview - Data Structures', 'A rigorous 60-minute mock interview simulating a FAANG process.', 'placements', 100000, 60, 'approved'),
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Resume Review', 'Detailed review and feedback for your tech resume.', 'placements', 20000, 30, 'approved')
ON CONFLICT (id) DO NOTHING;
