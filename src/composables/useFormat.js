// Con l'anno: la tabella dei film scelti copre mesi e anni.
const dateFormat = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

// "1979 · Ridley Scott": anno e regista possono mancare entrambi.
export function movieMeta(movie) {
    return [movie.year, movie.director].filter(Boolean).join(' · ');
}

export function imdbUrl(imdbId) {
    return `https://www.imdb.com/title/${imdbId}/`;
}

export function formatDate(value) {
    return value ? dateFormat.format(new Date(value)) : '';
}
