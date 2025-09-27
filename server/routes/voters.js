import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../utils/audit.js';

const router = express.Router();

// Get all voters
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('👥 Fetching voters with filters by admin:', req.user.email || req.user.id);
    const { search, course, year, section, hasVoted } = req.query;
    let query = 'SELECT id, student_id, full_name, course, year_level, section, has_voted, voted_at, created_at FROM voters WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (student_id LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (course) {
      query += ' AND course = ?';
      params.push(course);
    }

    if (year) {
      query += ' AND year_level = ?';
      params.push(year);
    }

    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }

    if (hasVoted) {
      if (hasVoted === 'voted') {
        query += ' AND has_voted = true';
      } else if (hasVoted === 'not_voted') {
        query += ' AND has_voted = false';
      }
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    console.log('✅ Voters fetched successfully, count:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Get voters error:', error);
    console.log('❌ Get voters error:', error.message);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

// Export voters
// Export voters - FIXED VERSION
// In your voters.js backend - FIX THE PARAMETER NAMES
// In your voters.js backend
// In your voters.js backend - COMPLETELY UPDATED
// Export voters - FIXED VERSION
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    console.log('📤 Export endpoint called with query:', req.query);
    
    const { 
      course, 
      year, 
      section, 
      hasVoted, 
      search,
      courses,
      studentIds,
      decryptPasswords
    } = req.query;
    
    // Handle include fields - fix parameter name
    const includeFields = req.query['include[]'] || req.query.include || [];
    const includeArray = Array.isArray(includeFields) ? includeFields : [includeFields].filter(Boolean);
    
    const coursesArray = Array.isArray(courses) ? courses : [courses].filter(Boolean);
    const studentIdsArray = Array.isArray(studentIds) ? studentIds : [studentIds].filter(Boolean);
    
    console.log('🔍 Include fields requested:', includeArray);

    // Map frontend field names to database column names - FIXED MAPPING
    const fieldMapping = {
      studentId: 'student_id',
      fullName: 'full_name', 
      course: 'course',
      yearLevel: 'year_level',
      section: 'section',
      hasVoted: 'has_voted',
      votedAt: 'voted_at',
      createdAt: 'created_at'
      // password is handled separately
    };

    // Start with basic required fields
    let selectFields = ['id']; // Always include ID for processing
    
    // If specific fields are requested, use them; otherwise, use all basic fields
    if (includeArray.length > 0) {
      includeArray.forEach(field => {
        if (fieldMapping[field]) {
          selectFields.push(fieldMapping[field]);
        }
      });
      
      // Always include password field if password option is selected
      if (includeArray.includes('password') && decryptPasswords === 'true') {
        selectFields.push('student_id', 'full_name', 'year_level', 'section');
      }
    } else {
      // Default fields if none specified
      selectFields = ['student_id', 'full_name', 'course', 'year_level', 'section', 'has_voted'];
    }

    console.log('📊 Fields to select from database:', selectFields);

    let query = `SELECT ${selectFields.join(', ')} FROM voters WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (studentIdsArray.length > 0 && studentIdsArray[0] !== '') {
      const placeholders = studentIdsArray.map(() => '?').join(',');
      query += ` AND id IN (${placeholders})`;
      params.push(...studentIdsArray.map(id => parseInt(id)));
      console.log('✅ Applied student IDs filter:', studentIdsArray);
    }
    else if (coursesArray.length > 0 && coursesArray[0] !== '') {
      const placeholders = coursesArray.map(() => '?').join(',');
      query += ` AND course IN (${placeholders})`;
      params.push(...coursesArray);
      console.log('✅ Applied course filters:', coursesArray);
    }
    
    if (course && course !== '') {
      query += ' AND course = ?';
      params.push(course);
    }
    
    if (year && year !== '') {
      query += ' AND year_level = ?';
      params.push(parseInt(year));
    }
    
    if (section && section !== '') {
      query += ' AND section = ?';
      params.push(section);
    }
    
    if (hasVoted === 'voted') {
      query += ' AND has_voted = true';
    } else if (hasVoted === 'not_voted') {
      query += ' AND has_voted = false';
    }
    
    if (search) {
      query += ' AND (student_id LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY course, year_level, section, full_name';
    
    console.log('🔍 Final query:', query);
    console.log('📋 Query params:', params);

    const [voters] = await pool.execute(query, params);
    console.log('✅ Database query successful, found:', voters.length, 'voters');
    
    if (voters.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No voters found matching the criteria'
      });
    }
    
    // Process data for export - ONLY INCLUDED FIELDS
    const processedVoters = voters.map(voter => {
      const voterData = {};
      
      // Handle each field based on includeArray
      if (includeArray.length > 0) {
        includeArray.forEach(field => {
          switch(field) {
            case 'studentId':
              voterData.student_id = voter.student_id;
              break;
            case 'fullName':
              voterData.full_name = voter.full_name;
              break;
            case 'course':
              voterData.course = voter.course;
              break;
            case 'yearLevel':
              voterData.year_level = voter.year_level;
              break;
            case 'section':
              voterData.section = voter.section;
              break;
            case 'hasVoted':
              voterData.has_voted = voter.has_voted ? 'Yes' : 'No';
              break;
            case 'votedAt':
              if (voter.voted_at) {
                voterData.voted_at = new Date(voter.voted_at).toLocaleString();
              } else {
                voterData.voted_at = 'Not Voted';
              }
              break;
            case 'createdAt':
              if (voter.created_at) {
                voterData.created_at = new Date(voter.created_at).toLocaleString();
              }
              break;
            case 'password':
              // Generate temporary password using the same function as frontend
              if (decryptPasswords === 'true') {
                voterData.password = generateTemporaryPassword(voter);
              }
              break;
          }
        });
      } else {
        // Default fields if none specified
        voterData.student_id = voter.student_id;
        voterData.full_name = voter.full_name;
        voterData.course = voter.course;
        voterData.year_level = voter.year_level;
        voterData.section = voter.section;
        voterData.has_voted = voter.has_voted ? 'Yes' : 'No';
        
        // Include password if decryptPasswords is true
        if (decryptPasswords === 'true') {
          voterData.password = generateTemporaryPassword(voter);
        }
      }
      
      return voterData;
    });

    console.log('✅ Processed voters data sample:', processedVoters[0]);
    console.log('📊 Fields in exported data:', Object.keys(processedVoters[0]));
    
    res.json({
      success: true,
      data: processedVoters,
      count: processedVoters.length,
      exportedAt: new Date().toISOString(),
      includedFields: includeArray.length > 0 ? includeArray : ['all basic fields']
    });
    
  } catch (error) {
    console.error('❌ Export voters error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to export voters data: ' + error.message 
    });
  }
});


// Function to generate temporary passwords (same algorithm as frontend)
function generateTemporaryPassword(voter) {
  try {
    const studentId = voter.student_id || '';
    const fullName = voter.full_name || '';
    const yearLevel = voter.year_level || 1;
    const section = voter.section || '';
    
    if (!fullName.trim() || !studentId.trim()) {
      return 'PASSWORD_UNAVAILABLE';
    }

    const lastThreeDigits = studentId.trim().slice(-3);
    const nameParts = fullName.trim().split(/\s+/);
    const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');
    const cleanSection = section.replace(/\s+/g, '').toLowerCase();
    
    return `${initials}${yearLevel}${cleanSection}-${lastThreeDigits}`;
  } catch (error) {
    console.error('Password generation error:', error);
    return 'GENERATION_ERROR';
  }
}

// Create voter
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('➕ Creating new voter:', req.body.studentId, 'by admin:', req.user.email || req.user.id);
    const { studentId, fullName, course, yearLevel, section, password } = req.body;

    if (!studentId || !fullName || !course || !yearLevel || !section || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO voters (student_id, full_name, course, year_level, section, password) VALUES (?, ?, ?, ?, ?, ?)',
      [studentId, fullName, course, yearLevel, section, hashedPassword]
    );

    await logAuditAction(req.user.id, 'admin', 'CREATE_VOTER', `Created voter: ${studentId}`, req);

    console.log('✅ Voter created successfully:', studentId);
    res.status(201).json({ id: result.insertId, message: 'Voter created successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('❌ Voter creation failed - Student ID already exists:', req.body.studentId);
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    console.error('Create voter error:', error);
    console.log('❌ Create voter error for:', req.body.studentId, error.message);
    res.status(500).json({ error: 'Failed to create voter' });
  }
});

// Update voter
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('✏️ Updating voter ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;
    const { studentId, fullName, course, yearLevel, section, password } = req.body;

    let query = 'UPDATE voters SET student_id = ?, full_name = ?, course = ?, year_level = ?, section = ?';
    let params = [studentId, fullName, course, yearLevel, section];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.execute(query, params);

    await logAuditAction(req.user.id, 'admin', 'UPDATE_VOTER', `Updated voter ID: ${id}`, req);

    console.log('✅ Voter updated successfully, ID:', id);
    res.json({ message: 'Voter updated successfully' });
  } catch (error) {
    console.error('Update voter error:', error);
    console.log('❌ Update voter error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to update voter' });
  }
});

// Delete voter
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🗑️ Deleting voter ID:', req.params.id, 'by admin:', req.user.email || req.user.id);
    const { id } = req.params;

    await pool.execute('DELETE FROM voters WHERE id = ?', [id]);

    await logAuditAction(req.user.id, 'admin', 'DELETE_VOTER', `Deleted voter ID: ${id}`, req);

    console.log('✅ Voter deleted successfully, ID:', id);
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    console.error('Delete voter error:', error);
    console.log('❌ Delete voter error for ID:', req.params.id, error.message);
    res.status(500).json({ error: 'Failed to delete voter' });
  }
});

export default router;
