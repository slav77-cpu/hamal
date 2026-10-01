// Контейнер за рендиране на .astro страници в тестовете — с Preact, за калкулатора и формата.
import { getContainerRenderer } from '@astrojs/preact/container-renderer';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';

export async function createContainer() {
  const renderers = await loadRenderers([getContainerRenderer()]);
  return AstroContainer.create({ renderers });
}
