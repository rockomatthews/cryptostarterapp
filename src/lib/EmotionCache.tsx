'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider as DefaultCacheProvider } from '@emotion/react';

// Adapted from https://github.com/mui/material-ui/tree/master/examples/material-ui-nextjs-ts

export function NextAppDirEmotionCacheProvider(props: {
  options: Parameters<typeof createCache>[0];
  CacheProvider?: React.ComponentType<{
    value: ReturnType<typeof createCache>;
    children: React.ReactNode;
  }>;
  children: React.ReactNode;
}) {
  const { options, CacheProvider = DefaultCacheProvider, children } = props;
  
  const [registry] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: { name: string; isGlobal: boolean }[] = [];
    
    cache.insert = (...args) => {
      const [selector, serialized] = args;
      if (serialized.name !== undefined && !serialized.name.startsWith('')) {
        const name = serialized.name;
        const isGlobal = !selector;
        const existingIndex = inserted.findIndex(
          (item) => item.name === name && item.isGlobal === isGlobal
        );
        
        if (existingIndex === -1) {
          inserted.push({ name, isGlobal });
        }
      }
      return prevInsert(...args);
    };
    
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    
    return { cache, flush };
  });
  
  useServerInsertedHTML(() => {
    const inserted = registry.flush();
    if (inserted.length === 0) {
      return null;
    }
    
    let styles = '';
    const dataEmotionAttribute = registry.cache.key;
    
    const tags = Array.from(
      document.querySelectorAll(`style[data-emotion="${dataEmotionAttribute}"]`)
    ) as HTMLStyleElement[];
    
    tags.forEach((tag) => {
      styles += tag.innerHTML;
      tag.setAttribute('data-s', '');
    });
    
    return (
      <style
        key={dataEmotionAttribute}
        data-emotion={dataEmotionAttribute}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });
  
  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
} 