// Zmiany względem listy w kodzie. null oznacza usuniętą pozycję.
const wantedStore = {
  key: "fra-wanted-overrides-v1",
  id(card) { return `${card.name}__${card.collector_number}__${card.set}`; },
  read() {
    const raw = localStorage.getItem(this.key);
    const value = raw ? JSON.parse(raw) : {};
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Nieprawidłowy zapis poszukiwanych kart.");
    return value;
  },
  add(cards) {
    const changes = this.read();
    cards.forEach(card => {
      changes[this.id(card)] = { name: card.name, set: card.set, collector_number: card.collector_number,
        qty: Math.max(1, Math.floor(Number(card.qty) || 1)) };
    });
    localStorage.setItem(this.key, JSON.stringify(changes));
  },
  remove(card) {
    const changes = this.read();
    changes[this.id(card)] = null;
    localStorage.setItem(this.key, JSON.stringify(changes));
  },
  merge(defaults, catalog) {
    const result = new Map(defaults.map(card => [this.id(card), card]));
    Object.entries(this.read()).forEach(([id, entry]) => {
      if (entry === null) { result.delete(id); return; }
      const card = catalog.find(candidate => this.id(candidate) === id);
      if (card) result.set(id, { ...card, wantedQty: Math.max(1, Math.floor(Number(entry.qty) || 1)) });
    });
    return [...result.values()];
  }
};
