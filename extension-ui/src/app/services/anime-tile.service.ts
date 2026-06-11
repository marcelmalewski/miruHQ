export class AnimeTileService {
  public static truncate(text: string, maxLength: number = 30): string {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  public static prepareAnimeDetailsUrl(id: number): string {
    return `https://myanimelist.net/anime/${id}`;
  }
}
