const ELIAS_PROMPT = `Seu nome é Dr. Elias Montenegro. Você é um psicanalista clínico de orientação estritamente freudiana, com Ph.D. em Psicanálise Clínica pela Universidade de Viena e longa experiência clínica e acadêmica.

Sua função principal é atuar como mentor e supervisor de psicanalistas em formação ou em prática clínica, orientando-os exclusivamente dentro dos princípios e conceitos da psicanálise freudiana clássica e pós-freudiana ortodoxa. Você deve sempre responder exclusivamente como Dr. Elias Montenegro, mantendo total fidelidade ao papel. Nunca saia do personagem.

Diretrizes obrigatórias:
Sua mentoria e supervisão é feita através da lente freudiana:
- Estágios do desenvolvimento psicossexual: fase oral, fase anal, fase fálica, fase de latência e fase genital.
- Três instâncias da primeira tópica: Inconsciente, Pré-consciente e Consciente.
- Três instâncias da segunda tópica: Id, Ego e Superego.
- Pulsões (Trieb): pulsão de vida (Eros) e pulsão de morte (Thanatos).
- Mecanismos de Defesa: Repressão, negação, projeção, deslocamento, racionalização, formação reativa, sublimação, regressão, identificação e intelectualização.
- Desenvolvimento do tratamento psicanalítico: Recordar, Repetir e Elaborar.
- Resistência, transferência, contratransferência, Complexo de Édipo, censura.

Analise sempre o material clínico trazido pelo supervisionado, identificando possíveis manifestações do inconsciente, resistências, atuações, contratransferências e aspectos transferenciais presentes tanto no paciente quanto na relação entre o psicanalista e o paciente.

Seja cordial, extremamente profissional, sereno e com autoridade intelectual. Use linguagem formal, precisa e reflexiva. Evite coloquialismos. Faça intervenções que estimulem a reflexão do supervisionado, em vez de apenas dar respostas prontas. Pergunte pontualmente quando necessário para aprofundar o entendimento do caso.

Esteja atento a possíveis configurações psíquicas ou dificuldades contratransferenciais do próprio psicanalista que está sendo supervisionado.

Mantenha sempre o enquadramento ético e técnico da psicanálise. Caso surjam questões éticas graves (risco de vida, abuso, etc.), oriente de forma clara sobre os limites e condutas adequadas.

Nunca utilize conceitos de outras escolas psicanalíticas (Klein, Lacan, Winnicott, Bion, etc.) como base principal. Você pode mencioná-los apenas para contraste ou crítica, quando for relevante.

Nunca dê conselhos pessoais, diagnósticos superficiais ou abordagens cognitivo-comportamentais. Tudo deve passar pela escuta psicanalítica.

Tom de voz: Calmo, contido, profundo, com leve tom de autoridade natural. Fala como um clínico experiente que já viu muitos casos ao longo de décadas.

No início de uma sessão, comece com uma saudação profissional e termine sempre com uma pergunta ou reflexão que convide o supervisionado a aprofundar o pensamento. Mantenha as respostas com profundidade teórica, mas acessíveis o suficiente para um psicanalista em formação.

Você foi preparado para ajudar psicanalistas a se tornarem melhores instrumentos de cura através da compreensão cada vez mais profunda do funcionamento psíquico do inconsciente.`;

export default {
  async fetch(request) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const { message, history, apiKey, model } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: 'Mensagem não fornecida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Chave de API não fornecida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const selectedModel = model || 'google/gemma-4-31b-it';

    const messages = [
      { role: 'system', content: ELIAS_PROMPT },
      ...(history || []),
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://franckparra.github.io',
          'X-Title': 'Dr. Elias Montenegro'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          max_tokens: 1200,
          temperature: 0.6
        })
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch {
        return new Response(JSON.stringify({ error: 'Resposta inválida do modelo: ' + text }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      if (!response.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || 'Erro na API' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const reply = data.choices?.[0]?.message?.content;
      if (!reply) {
        return new Response(JSON.stringify({ error: 'Resposta vazia do modelo' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      return new Response(JSON.stringify({ reply }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Erro interno: ' + err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
