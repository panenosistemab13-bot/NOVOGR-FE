/**
 * Extrai a cidade para a coluna de Distribuição: Destino/Unidade
 * Regras do usuário:
 * 1. Mostre somente a primeira cidade (ao invés de: campo grande x santa luzia : 10 iscas -> campo grande: 10 iscas).
 * 2. Caso não tenha o nome da cidade na frente, use o segundo nome (ex: a definir x cuiabá: 4 iscas -> CUIABÁ: 4 iscas).
 * 3. Quando não houver uma cidade na frente e tiver "santa luzia", ignore / não mostre a informação (ex: a definir x santa luzia -> ignora).
 */
export function extractCityForDistribution(destinoRaw?: string, unidadeRaw?: string): string | null {
  const isInvalid = (str?: string): boolean => {
    if (!str) return true;
    const up = str.trim().toUpperCase();
    return (
      up === '' ||
      up === '-' ||
      up === '--' ||
      up === '---' ||
      up === 'A DEFINIR' ||
      up === 'A DEFINIR...' ||
      up === 'INDEFINIDO' ||
      up === 'NÃO INFORMADO' ||
      up === 'NAO INFORMADO' ||
      up === 'NÃO INFORMADA' ||
      up === 'NAO INFORMADA' ||
      up === 'SEM DESTINO' ||
      up === 'PENDENTE' ||
      up === 'S/ DESTINO' ||
      up === 'S/D' ||
      up === 'N/A' ||
      up === 'NULL' ||
      up === 'UNDEFINED'
    );
  };

  let first = (destinoRaw || '').trim();
  let second = (unidadeRaw || '').trim();

  // Caso contenha separadores como " x ", " X ", " / ", " ➔ ", " - ", " -> "
  const splitRegex = /\s+(?:[xX\/➔]|->|-)\s+/;
  if (splitRegex.test(first)) {
    const parts = first.split(splitRegex);
    first = (parts[0] || '').trim();
    if (parts[1]) {
      second = parts[1].trim();
    }
  }

  // 1. Verificar se há uma primeira cidade válida na frente
  if (!isInvalid(first)) {
    return first.toUpperCase();
  }

  // 2. Quando NÃO houver uma primeira cidade válida na frente:
  if (isInvalid(second)) {
    return null;
  }

  const secondUp = second.toUpperCase();
  // "quando nao houver uma cidade na frente ignore quando tiver 'santa luzia' nao mostre a informação"
  if (secondUp.includes('SANTA LUZIA')) {
    return null;
  }

  // Usa o segundo nome
  return secondUp;
}
