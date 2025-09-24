// netlify/functions/callback.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // CORS заголовки
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Обработка preflight запроса
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Разрешаем только POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Получаем переменные окружения
    const AIRTABLE_API_KEY = process.env.AIR_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = 'callback'; // или используйте process.env.AIRTABLE_TABLE_ID

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Server configuration error' })
      };
    }

    // Парсим данные из запроса
    const data = JSON.parse(event.body);
    
    // Валидация обязательных полей
    if (!data.Name || !data.Phone) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Name and Phone are required' })
      };
    }

    // Подготавливаем данные для Airtable
    const airtableData = {
      fields: {
        "Name": sanitizeString(data.Name),
        "Phone": sanitizeString(data.Phone),
        "Call Time": sanitizeString(data['Call Time'] || ''),
        "Comment": sanitizeString(data.Comment || ''),
        "Project info": sanitizeString(data['Project info'] || ''),
        "Status": "Новая",
        "Source": "Сайт",
        "Done": false
      }
    };

    // Добавляем дополнительные поля если они есть
    if (data.Email) {
      airtableData.fields.Email = sanitizeString(data.Email);
    }

    // Добавляем заметки с дополнительной информацией
    let notes = [];
    if (data.page_url) notes.push(`URL: ${data.page_url}`);
    if (data.utm_source) notes.push(`UTM Source: ${data.utm_source}`);
    if (data.utm_medium) notes.push(`UTM Medium: ${data.utm_medium}`);
    if (data.utm_campaign) notes.push(`UTM Campaign: ${data.utm_campaign}`);
    
    if (notes.length > 0) {
      airtableData.fields.Notes = notes.join('\n');
    }

    // Отправляем в Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtableData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Airtable API error:', responseData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: responseData.error?.message || 'Airtable API error'
        })
      };
    }

    // Отправляем email уведомление (опционально)
    try {
      await sendEmailNotification(airtableData.fields);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Не прерываем выполнение, так как основная задача выполнена
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Заявка успешно отправлена',
        record: responseData
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

// Функция очистки строк
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500); // Ограничиваем длину
}

// Функция отправки email уведомления
async function sendEmailNotification(data) {
  // Если у вас есть email сервис (SendGrid, Mailgun и т.д.)
  // Пример с SendGrid:
  
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: 'info@srubsibir.ru',
    from: 'noreply@srubsibir.ru',
    subject: `Новая заявка на обратный звонок - ${new Date().toLocaleDateString('ru-RU')}`,
    html: `
      <h2>Новая заявка на обратный звонок</h2>
      <p><strong>Имя:</strong> ${data.Name}</p>
      <p><strong>Телефон:</strong> ${data.Phone}</p>
      ${data.Email ? `<p><strong>Email:</strong> ${data.Email}</p>` : ''}
      ${data['Call Time'] ? `<p><strong>Удобное время:</strong> ${data['Call Time']}</p>` : ''}
      ${data.Comment ? `<p><strong>Комментарий:</strong> ${data.Comment}</p>` : ''}
      ${data['Project info'] ? `<p><strong>Проект:</strong> ${data['Project info']}</p>` : ''}
      <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
      <p><strong>Источник:</strong> ${data.Source}</p>
    `
  };

  await sgMail.send(msg);
  */
}