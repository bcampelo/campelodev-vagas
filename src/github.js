const BASE = 'https://api.github.com';

function cabecalhos() {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'campelodev-vagas (https://github.com/bcampelo/campelodev-vagas)',
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/**
 * Busca as issues abertas mais recentes de um repositório de vagas.
 * Pull requests vêm misturados nesse endpoint, por isso o filtro no final.
 */
export async function buscarVagas(repo, porRepo) {
  const url = `${BASE}/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=${porRepo}`;
  const res = await fetch(url, { headers: cabecalhos() });

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset');
    throw new Error(
      `limite da API do GitHub atingido em ${repo}` +
        (reset ? `, libera às ${new Date(reset * 1000).toLocaleTimeString('pt-BR')}` : '')
    );
  }
  if (!res.ok) throw new Error(`${repo} respondeu ${res.status}`);

  const issues = await res.json();
  return issues
    .filter((i) => !i.pull_request)
    .map((i) => ({
      id: `${repo}#${i.number}`,
      repo,
      titulo: (i.title || '').trim(),
      url: i.html_url,
      autor: i.user?.login ?? 'desconhecido',
      autorFoto: i.user?.avatar_url ?? null,
      criadaEm: i.created_at,
      etiquetas: (i.labels || []).map((l) => (typeof l === 'string' ? l : l.name)),
      corpo: i.body || '',
    }));
}
