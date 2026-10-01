import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../../types/property';
import { useFavorites } from '../../context/FavoritesContext';
import { ListingCard } from './ListingCard';
import { PropertyCard } from './PropertyCard';
import { ease } from '../ui/motion';

/** Animated grid: cards glide to new positions when filters change, and fade in/out as they match. */
export function PropertyGrid({ properties, layout = 'grid' }: { properties: Property[]; layout?: 'grid' | 'list' }) {
  const { isFavorite, toggle } = useFavorites();
  const navigate = useNavigate();
  const onToggle = async (id: string) => {
    if (!(await toggle(id))) navigate('/login');
  };

  return (
    <motion.ul layout className={layout === 'list' ? 'flex flex-col gap-5' : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3'}>
      <AnimatePresence mode="popLayout" initial={false}>
        {properties.map((p) => (
          <motion.li key={p.id} layout
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4, ease }}>
            {layout === 'list' ? (
              <ListingCard property={p} isFavorite={isFavorite(p.id)} onToggleFavorite={onToggle} />
            ) : (
              <PropertyCard property={p} isFavorite={isFavorite(p.id)} onToggleFavorite={onToggle} />
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
