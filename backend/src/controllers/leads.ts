import { Request, Response } from 'express';
import { getDB } from '../config/db';
import { analyzeLeadWithAI } from '../services/ai';
import { sendTelegramNotification } from '../services/telegram';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitLead = async (req: Request, res: Response) => {
  const { name, phone, email, business_requirement, budget, notes } = req.body;

  if (!name || !phone || !email || !business_requirement || !budget) {
    return res.status(400).json({ message: 'Missing required lead details' });
  }

  try {
    const db = await getDB();
    
    // Insert lead row
    const insertLeadSql = `
      INSERT INTO leads (name, phone, email, business_requirement, budget, notes, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) ${db.isPostgres() ? 'RETURNING id' : ''}
    `;
    const params = [name, phone, email, business_requirement, budget, notes || '', 'new'];
    const { lastID } = await db.run(insertLeadSql, params);
    
    const leadId = Number(lastID);
    if (!leadId) {
      throw new Error('Failed to retrieve inserted lead ID');
    }

    // Call AI analysis
    console.log(`[LEAD SUBMIT] Qualifying new lead ID ${leadId} via AI service...`);
    const analysis = await analyzeLeadWithAI(name, email, phone, business_requirement, budget, notes);

    // Save analysis row
    const insertAnalysisSql = `
      INSERT INTO lead_analysis (lead_id, lead_score, business_type, summary, buying_intent, urgency_score, follow_up_message)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const analysisParams = [
      leadId,
      analysis.lead_score,
      analysis.business_type,
      analysis.summary,
      analysis.buying_intent,
      analysis.urgency_score,
      analysis.follow_up_message,
    ];
    await db.run(insertAnalysisSql, analysisParams);

    // Send Telegram Notification
    await sendTelegramNotification(name, phone, analysis.business_type, analysis.lead_score, analysis.summary);

    return res.status(201).json({
      message: 'Lead captured and qualified successfully',
      leadId,
      analysis,
    });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Submit error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeads = async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search as string || '';
  const sortBy = req.query.sortBy as string || 'created_at';
  const sortOrder = req.query.sortOrder as string || 'desc';
  const status = req.query.status as string || '';
  const buyingIntent = req.query.buyingIntent as string || '';
  const minScore = Number(req.query.minScore || 0);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Whitelist sort fields to prevent SQL injection
  const allowedSortFields = ['created_at', 'lead_score', 'business_type', 'name'];
  const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
  const actualSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  try {
    const db = await getDB();
    
    // Construct search and filter conditions
    let queryConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      queryConditions.push(`(LOWER(l.name) LIKE $${paramIndex} OR LOWER(l.email) LIKE $${paramIndex} OR LOWER(l.business_requirement) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    if (status) {
      queryConditions.push(`l.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (buyingIntent) {
      queryConditions.push(`la.buying_intent = $${paramIndex}`);
      queryParams.push(buyingIntent);
      paramIndex++;
    }

    if (minScore > 0) {
      queryConditions.push(`la.lead_score >= $${paramIndex}`);
      queryParams.push(minScore);
      paramIndex++;
    }

    const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
    const sortColumn =
      actualSortBy === 'lead_score'
        ? 'la.lead_score'
        : actualSortBy === 'business_type'
        ? 'la.business_type'
        : `l.${actualSortBy}`;

    // Fetch total matching records
    const countSql = `
      SELECT COUNT(*) as count 
      FROM leads l
      LEFT JOIN lead_analysis la ON l.id = la.lead_id
      ${whereClause}
    `;
    const countResult = await db.query(countSql, queryParams);
    const totalCount = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated records
    const selectSql = `
      SELECT l.*, la.lead_score, la.business_type, la.buying_intent
      FROM leads l
      LEFT JOIN lead_analysis la ON l.id = la.lead_id
      ${whereClause}
      ORDER BY ${sortColumn} ${actualSortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const pageParams = [...queryParams, limit, offset];
    const leads = await db.query(selectSql, pageParams);

    return res.status(200).json({
      leads,
      totalCount,
      totalPages,
      page,
    });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Get leads error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const db = await getDB();
    const sql = `
      SELECT l.*, la.lead_score, la.business_type, la.summary, la.buying_intent, la.urgency_score, la.follow_up_message
      FROM leads l
      LEFT JOIN lead_analysis la ON l.id = la.lead_id
      WHERE l.id = $1
    `;
    const rows = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = rows[0];
    
    // Structure response nicely
    const response = {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      business_requirement: lead.business_requirement,
      budget: lead.budget,
      notes: lead.notes,
      status: lead.status,
      created_at: lead.created_at,
      analysis: lead.lead_score !== null ? {
        lead_score: lead.lead_score,
        business_type: lead.business_type,
        summary: lead.summary,
        buying_intent: lead.buying_intent,
        urgency_score: lead.urgency_score,
        follow_up_message: lead.follow_up_message,
      } : undefined,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[LEAD CONTROLLER] Get lead by ID error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLeadStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const allowedStatuses = ['new', 'contacted', 'qualified', 'unqualified'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const db = await getDB();
    await db.run('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);
    return res.status(200).json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Update status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const reanalyzeLead = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const db = await getDB();
    const leads = await db.query('SELECT * FROM leads WHERE id = $1', [id]);

    if (leads.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = leads[0];
    const analysis = await analyzeLeadWithAI(
      lead.name,
      lead.email,
      lead.phone,
      lead.business_requirement,
      lead.budget,
      lead.notes
    );

    // Check if analysis exists
    const existingAnalysis = await db.query('SELECT * FROM lead_analysis WHERE lead_id = $1', [id]);

    if (existingAnalysis.length > 0) {
      const updateSql = `
        UPDATE lead_analysis
        SET lead_score = $1, business_type = $2, summary = $3, buying_intent = $4, urgency_score = $5, follow_up_message = $6
        WHERE lead_id = $7
      `;
      await db.run(updateSql, [
        analysis.lead_score,
        analysis.business_type,
        analysis.summary,
        analysis.buying_intent,
        analysis.urgency_score,
        analysis.follow_up_message,
        id,
      ]);
    } else {
      const insertSql = `
        INSERT INTO lead_analysis (lead_id, lead_score, business_type, summary, buying_intent, urgency_score, follow_up_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await db.run(insertSql, [
        id,
        analysis.lead_score,
        analysis.business_type,
        analysis.summary,
        analysis.buying_intent,
        analysis.urgency_score,
        analysis.follow_up_message,
      ]);
    }

    return res.status(200).json({ message: 'Lead reanalyzed successfully', analysis });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Reanalyze error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();

    const totalLeadsResult = await db.query('SELECT COUNT(*) as count FROM leads');
    const totalLeads = Number(totalLeadsResult[0]?.count || 0);

    // Dialect specific query for today's leads count
    let todaysLeadsSql = '';
    if (db.isPostgres()) {
      todaysLeadsSql = "SELECT COUNT(*) as count FROM leads WHERE created_at >= CURRENT_DATE";
    } else {
      todaysLeadsSql = "SELECT COUNT(*) as count FROM leads WHERE created_at >= date('now', 'start of day')";
    }
    const todaysLeadsResult = await db.query(todaysLeadsSql);
    const todaysLeads = Number(todaysLeadsResult[0]?.count || 0);

    const avgScoreResult = await db.query('SELECT AVG(lead_score) as avg FROM lead_analysis');
    const averageScore = Number(avgScoreResult[0]?.avg || 0);

    const highQualityResult = await db.query('SELECT COUNT(*) as count FROM lead_analysis WHERE lead_score >= 80');
    const highQualityCount = Number(highQualityResult[0]?.count || 0);

    return res.status(200).json({
      totalLeads,
      todaysLeads,
      averageScore,
      highQualityCount,
    });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const recentLeads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();
    const sql = `
      SELECT l.id, l.name, l.email, l.business_requirement, l.created_at, la.lead_score, la.business_type, la.buying_intent
      FROM leads l
      LEFT JOIN lead_analysis la ON l.id = la.lead_id
      ORDER BY l.created_at DESC
      LIMIT 5
    `;
    const leads = await db.query(sql);
    return res.status(200).json(leads);
  } catch (error) {
    console.error('[LEAD CONTROLLER] Recent leads error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInsights = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();

    const statusBreakdown = await db.query(`
      SELECT status, COUNT(*) as count
      FROM leads
      GROUP BY status
      ORDER BY count DESC
    `);

    const businessBreakdown = await db.query(`
      SELECT business_type, COUNT(*) as count, AVG(lead_score) as average_score
      FROM lead_analysis
      GROUP BY business_type
      ORDER BY count DESC
    `);

    const intentBreakdown = await db.query(`
      SELECT buying_intent, COUNT(*) as count
      FROM lead_analysis
      GROUP BY buying_intent
      ORDER BY count DESC
    `);

    const hotLeads = await db.query(`
      SELECT l.id, l.name, l.email, l.phone, l.business_requirement, l.status, l.created_at,
             la.lead_score, la.business_type, la.buying_intent, la.urgency_score
      FROM leads l
      INNER JOIN lead_analysis la ON l.id = la.lead_id
      WHERE la.lead_score >= 80 OR la.urgency_score >= 80 OR la.buying_intent = 'High'
      ORDER BY la.lead_score DESC, la.urgency_score DESC, l.created_at DESC
      LIMIT 5
    `);

    const totals = await db.query(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified_leads
      FROM leads
    `);

    const totalLeads = Number(totals[0]?.total_leads || 0);
    const qualifiedLeads = Number(totals[0]?.qualified_leads || 0);
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

    return res.status(200).json({
      statusBreakdown,
      businessBreakdown,
      intentBreakdown,
      hotLeads,
      conversionRate,
    });
  } catch (error) {
    console.error('[LEAD CONTROLLER] Insights error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const exportLeadsCsv = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDB();
    const leads = await db.query(`
      SELECT l.id, l.name, l.phone, l.email, l.business_requirement, l.budget, l.notes, l.status, l.created_at,
             la.lead_score, la.business_type, la.buying_intent, la.urgency_score, la.summary, la.follow_up_message
      FROM leads l
      LEFT JOIN lead_analysis la ON l.id = la.lead_id
      ORDER BY l.created_at DESC
    `);

    const headers = [
      'id',
      'name',
      'phone',
      'email',
      'business_requirement',
      'budget',
      'notes',
      'status',
      'created_at',
      'lead_score',
      'business_type',
      'buying_intent',
      'urgency_score',
      'summary',
      'follow_up_message',
    ];

    const escapeCsv = (value: unknown) => {
      const text = value === null || value === undefined ? '' : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.join(','),
      ...leads.map((lead: any) => headers.map((header) => escapeCsv(lead[header])).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="qualiai-leads.csv"');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('[LEAD CONTROLLER] Export CSV error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConfigInfo = async (req: AuthenticatedRequest, res: Response) => {
  const db = await getDB();
  return res.status(200).json({
    mode: (process.env.OPENROUTER_API_KEY && process.env.DATABASE_URL) ? 'Production' : 'Demo',
    databaseProvider: db.isPostgres() ? 'postgres' : 'sqlite',
    openRouterConfigured: !!process.env.OPENROUTER_API_KEY,
    telegramConfigured: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
    telegramChatId: process.env.TELEGRAM_CHAT_ID ? `${process.env.TELEGRAM_CHAT_ID.slice(0, 4)}***` : 'None',
  });
};

export const testTelegram = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await sendTelegramNotification(
      'System Test Lead',
      '+1 (555) 019-2834',
      'Real Estate',
      92,
      'Integration testing completed. Telegram Bot webhook link fully operational.'
    );

    if (result) {
      return res.status(200).json({ message: 'Test message triggered successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to send test message' });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
