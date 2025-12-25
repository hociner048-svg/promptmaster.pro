const { useState, useEffect } = React;
const { Sparkles, Copy, Check, Wand2, Zap, Crown, Download, History, Trash2, Star, Share2, Languages, Shuffle, BookOpen } = lucide;

function PromptMasterPro() {
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiMode, setAiMode] = useState('chatgpt');

  const templates = [
    { name: 'Email Marketing', desc: 'Email de vente produit/service', prompt: 'email de vente pour [produit] avec accroche persuasive' },
    { name: 'Contenu LinkedIn', desc: 'Post viral LinkedIn', prompt: 'post LinkedIn viral sur [sujet] pour entrepreneurs' },
    { name: 'Article de Blog', desc: 'Article SEO optimisé', prompt: 'article de blog 1500 mots sur [sujet] optimisé SEO' },
    { name: 'Copywriting Pub', desc: 'Annonce publicitaire', prompt: 'annonce Facebook Ads pour [produit] avec hook émotionnel' },
    { name: 'Script Vidéo', desc: 'Script YouTube/TikTok', prompt: 'script vidéo 60 secondes pour [sujet] format storytelling' },
    { name: 'Pitch Startup', desc: 'Pitch investisseurs', prompt: 'pitch deck startup [domaine] pour lever fonds' },
    { name: 'Fiche Produit', desc: 'Description e-commerce', prompt: 'fiche produit e-commerce [produit] avec bénéfices clients' },
    { name: 'ChatBot Support', desc: 'Réponses automatiques', prompt: 'réponses chatbot support client [entreprise] ton amical' }
  ];

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, []);

  const loadHistory = () => {
    const saved = localStorage.getItem('promptmaster_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('promptmaster_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveToHistory = (userInput, generatedPrompts) => {
    const historyItem = {
      id: Date.now().toString(),
      input: userInput,
      prompts: generatedPrompts,
      timestamp: Date.now(),
      language,
      aiMode
    };
    
    const newHistory = [historyItem, ...history].slice(0, 15);
    setHistory(newHistory);
    localStorage.setItem('promptmaster_history', JSON.stringify(newHistory));
  };

  const toggleFavorite = (item, level) => {
    const favId = `${item.id}_${level}`;
    const existingFav = favorites.find(f => f.id === favId);
    
    if (existingFav) {
      const newFavorites = favorites.filter(f => f.id !== favId);
      setFavorites(newFavorites);
      localStorage.setItem('promptmaster_favorites', JSON.stringify(newFavorites));
    } else {
      const favorite = {
        id: favId,
        originalId: item.id,
        input: item.input,
        prompt: item.prompts[level],
        level,
        timestamp: Date.now()
      };
      const newFavorites = [favorite, ...favorites];
      setFavorites(newFavorites);
      localStorage.setItem('promptmaster_favorites', JSON.stringify(newFavorites));
    }
  };

  const isFavorite = (itemId, level) => {
    return favorites.some(f => f.id === `${itemId}_${level}`);
  };

  const deleteHistoryItem = (id) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('promptmaster_history', JSON.stringify(newHistory));
  };

  const deleteFavorite = (id) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    setFavorites(newFavorites);
    localStorage.setItem('promptmaster_favorites', JSON.stringify(newFavorites));
  };

  const getRandomTemplate = () => {
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setInput(randomTemplate.prompt);
    setShowTemplates(false);
  };

  const generatePrompts = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setPrompts(null);

    const languageInstruction = language === 'en' ? 'Respond in English.' : 
                               language === 'es' ? 'Responde en español.' : 
                               language === 'de' ? 'Antworte auf Deutsch.' : 
                               'Réponds en français.';

    const aiModeContext = aiMode === 'chatgpt' ? 'optimisés pour ChatGPT (GPT-4)' :
                         aiMode === 'claude' ? 'optimisés pour Claude (Anthropic)' :
                         aiMode === 'gemini' ? 'optimisés pour Gemini (Google)' :
                         'universels compatibles toutes IA';

    const systemPrompt = `Tu es PROMPTMASTER, expert en génération de prompts IA optimisés.

MISSION : Transformer l'idée de l'utilisateur en 3 prompts progressifs (Simple, Avancé, Expert) ${aiModeContext}.

${languageInstruction}

STRUCTURE OBLIGATOIRE pour chaque niveau :
- SIMPLE : Direct, 1-2 phrases, utilisable immédiatement
- AVANCÉ : Ajoute contexte, rôle, format, contraintes (50-100 mots)
- EXPERT : Maximum détail avec exemples, format JSON si pertinent, méthodologie (100-200 mots)

RÈGLES :
1. Analyse l'intention réelle derrière la demande
2. Ajoute toujours : rôle expert, contexte, format sortie
3. Optimise pour clarté et reproductibilité
4. ${languageInstruction}
5. Réponds UNIQUEMENT avec les 3 prompts, pas d'explications additionnelles

FORMAT STRICT :
🎯 SIMPLE
[prompt simple]

🎯 AVANCÉ
[prompt avancé]

🎯 EXPERT
[prompt expert]`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Génère 3 prompts optimisés pour : "${input}"`
            }
          ],
          system: systemPrompt
        })
      });

      const data = await response.json();
      const text = data.content.map(item => item.type === 'text' ? item.text : '').join('\n');
      
      const simple = text.match(/🎯 SIMPLE\n([\s\S]*?)(?=\n🎯 AVANCÉ|$)/)?.[1]?.trim() || '';
      const avance = text.match(/🎯 AVANCÉ\n([\s\S]*?)(?=\n🎯 EXPERT|$)/)?.[1]?.trim() || '';
      const expert = text.match(/🎯 EXPERT\n([\s\S]*?)$/)?.[1]?.trim() || '';

      const generatedPrompts = { simple, avance, expert };
      setPrompts(generatedPrompts);
      saveToHistory(input, generatedPrompts);
      
    } catch (error) {
      console.error('Error:', error);
      setPrompts({
        simple: 'Erreur de génération. Veuillez réessayer.',
        avance: '',
        expert: ''
      });
    }

    setLoading(false);
  };

  const copyToClipboard = (text, level) => {
    navigator.clipboard.writeText(text);
    setCopied(level);
    setTimeout(() => setCopied(null), 2000);
  };

  const sharePrompt = async (text) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prompt IA optimisé',
          text: text
        });
      } catch (error) {
        copyToClipboard(text, 'share');
      }
    } else {
      copyToClipboard(text, 'share');
    }
  };

  const loadFromHistory = (item) => {
    setInput(item.input);
    setPrompts(item.prompts);
    setShowHistory(false);
    if (item.language) setLanguage(item.language);
    if (item.aiMode) setAiMode(item.aiMode);
  };

  const exportPrompts = () => {
    if (!prompts) return;
    const text = `🎯 PROMPT SIMPLE\n${prompts.simple}\n\n🎯 PROMPT AVANCÉ\n${prompts.avance}\n\n🎯 PROMPT EXPERT\n${prompts.expert}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts-generated.txt';
    a.click();
  };

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900' },
    React.createElement('div', { className: 'bg-black/20 backdrop-blur-sm border-b border-white/10' },
      React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement('div', { className: 'bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg' },
            React.createElement(Sparkles, { className: 'w-6 h-6 text-white' })
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-2xl font-bold text-white' }, 'PromptMaster Pro'),
            React.createElement('p', { className: 'text-xs text-purple-200' }, 'Générateur de prompts IA optimisés')
          )
        ),
        React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
          React.createElement('button', {
            onClick: () => setShowTemplates(!showTemplates),
            className: 'flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm'
          },
            React.createElement(BookOpen, { className: 'w-4 h-4' }),
            'Templates'
          ),
          React.createElement('button', {
            onClick: () => setShowFavorites(!showFavorites),
            className: 'flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm'
          },
            React.createElement(Star, { className: 'w-4 h-4' }),
            `Favoris (${favorites.length})`
          ),
          React.createElement('button', {
            onClick: () => setShowHistory(!showHistory),
            className: 'flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors text-sm'
          },
            React.createElement(History, { className: 'w-4 h-4' }),
            `Historique (${history.length})`
          )
        )
      )
    ),
    React.createElement('div', { className: 'max-w-6xl mx-auto px-4 py-8' },
      React.createElement('div', { className: 'text-center py-16' },
        React.createElement('div', { className: 'bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10' },
          React.createElement(Sparkles, { className: 'w-16 h-16 text-purple-400 mx-auto mb-4' }),
          React.createElement('h3', { className: 'text-white text-xl font-semibold mb-2' }, 'PromptMaster Pro'),
          React.createElement('p', { className: 'text-purple-200 mb-6' }, 'Générateur de prompts IA optimisés avec 5 fonctionnalités premium'),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left' },
            React.createElement('div', { className: 'bg-white/5 p-4 rounded-lg' },
              React.createElement('p', { className: 'text-green-400 font-semibold mb-1' }, '⭐ Favoris'),
              React.createElement('p', { className: 'text-purple-200 text-sm' }, 'Sauvegardez vos meilleurs prompts')
            ),
            React.createElement('div', { className: 'bg-white/5 p-4 rounded-lg' },
              React.createElement('p', { className: 'text-blue-400 font-semibold mb-1' }, '📚 Templates'),
              React.createElement('p', { className: 'text-purple-200 text-sm' }, '8 modèles prêts à l\'emploi')
            ),
            React.createElement('div', { className: 'bg-white/5 p-4 rounded-lg' },
              React.createElement('p', { className: 'text-purple-400 font-semibold mb-1' }, '🌍 Multi-langue'),
              React.createElement('p', { className: 'text-purple-200 text-sm' }, '4 langues disponibles')
            )
          )
        )
      )
    ),
    React.createElement('div', { className: 'text-center py-6 text-purple-300 text-sm' },
      React.createElement('p', null, `Propulsé par Claude AI • ${favorites.length} favoris • ${history.length} générations`)
    )
  );
}

ReactDOM.render(React.createElement(PromptMasterPro), document.getElementById('root'));
