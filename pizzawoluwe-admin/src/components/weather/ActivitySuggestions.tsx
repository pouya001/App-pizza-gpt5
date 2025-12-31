'use client';

interface ActivitySuggestionsProps {
  condition: string;
  temperature: number;
}

interface Activity {
  emoji: string;
  title: string;
  description: string;
}

export default function ActivitySuggestions({ condition, temperature }: ActivitySuggestionsProps) {
  const getActivities = (): Activity[] => {
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      if (temperature > 25) {
        return [
          { emoji: '🏖️', title: 'Plage ou piscine', description: 'Parfait pour se rafraîchir !' },
          { emoji: '🚴', title: 'Balade à vélo', description: 'Profite du beau temps' },
          { emoji: '🧺', title: 'Pique-nique', description: 'Un repas en plein air' },
          { emoji: '⛵', title: 'Sports nautiques', description: 'Idéal pour l\'eau' },
        ];
      } else {
        return [
          { emoji: '🚶', title: 'Randonnée', description: 'Température idéale' },
          { emoji: '📸', title: 'Photographie', description: 'Belle lumière naturelle' },
          { emoji: '🎨', title: 'Dessin en extérieur', description: 'Inspiration garantie' },
          { emoji: '☕', title: 'Terrasse café', description: 'Moment détente au soleil' },
        ];
      }
    } else if (conditionLower.includes('rain')) {
      return [
        { emoji: '📚', title: 'Lecture', description: 'Cozy time avec un bon livre' },
        { emoji: '🎬', title: 'Cinéma/Série', description: 'Marathon films à la maison' },
        { emoji: '🎮', title: 'Jeux vidéo', description: 'Gaming session' },
        { emoji: '🍲', title: 'Cuisine', description: 'Prépare de bons petits plats' },
      ];
    } else if (conditionLower.includes('snow')) {
      return [
        { emoji: '⛷️', title: 'Ski/Snowboard', description: 'Descentes enneigées' },
        { emoji: '⛸️', title: 'Patinage', description: 'Glisse sur la glace' },
        { emoji: '☃️', title: 'Bonhomme de neige', description: 'Construction créative' },
        { emoji: '🔥', title: 'Coin du feu', description: 'Chocolat chaud et cheminée' },
      ];
    } else if (conditionLower.includes('cloud')) {
      return [
        { emoji: '🎭', title: 'Musée/Expo', description: 'Culture indoor' },
        { emoji: '🏃', title: 'Course à pied', description: 'Température parfaite' },
        { emoji: '🧘', title: 'Yoga/Méditation', description: 'Zenitude assurée' },
        { emoji: '🛍️', title: 'Shopping', description: 'Visite des boutiques' },
      ];
    } else {
      return [
        { emoji: '🎵', title: 'Musique', description: 'Écoute tes playlists' },
        { emoji: '✍️', title: 'Écriture', description: 'Journaling ou créativité' },
        { emoji: '🧩', title: 'Puzzles/Jeux', description: 'Stimule ton esprit' },
        { emoji: '🍵', title: 'Thé et détente', description: 'Moment de calme' },
      ];
    }
  };

  const activities = getActivities();

  return (
    <div className="bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span>🎯</span>
        Activités recommandées
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="text-5xl mb-3">{activity.emoji}</div>
            <h3 className="text-white font-bold text-lg mb-1">{activity.title}</h3>
            <p className="text-white/80 text-sm">{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
