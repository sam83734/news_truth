import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Article } from '../types';
import { newsApi } from '../api/newsApi';
import { Colors } from '../theme/colors';

interface SearchModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onDismiss,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const quickTags = ['Urgent', 'Zoning', 'Transit', 'Water', 'Privacy', 'Economics', 'Municipal'];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await newsApi.getArticles(undefined, query.trim());
        setResults(data);
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleTagPress = (tag: string) => {
    setQuery(tag);
  };

  const handleSelect = (article: Article) => {
    onDismiss();
    onSelectArticle(article);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* Search Header */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputBox}>
              <MaterialIcons name="search" size={20} color="#6750A4" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search ground reports, columns, topics..."
                placeholderTextColor="#79747E"
                autoFocus={true}
                style={styles.input}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                  <MaterialIcons name="close" size={16} color="#79747E" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={onDismiss} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Search Tag Pills */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>POPULAR TOPICS:</Text>
            <View style={styles.tagsRow}>
              {quickTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleTagPress(tag)}
                  style={[
                    styles.tagChip,
                    query.toLowerCase() === tag.toLowerCase() && styles.activeTagChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      query.toLowerCase() === tag.toLowerCase() && styles.activeTagChipText,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Results List or Loading */}
          {isSearching ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#6750A4" />
              <Text style={styles.loadingText}>Searching Next Truth archives...</Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleSelect(item)}
                  style={styles.resultItem}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
                  ) : (
                    <View style={styles.resultPlaceholder}>
                      <MaterialIcons name="article" size={20} color="#6750A4" />
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.resultCategory}>{item.category?.toUpperCase() || 'REPORT'}</Text>
                    <Text style={styles.resultTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.resultMeta}>
                      By {item.authorName} • {item.dateOrTimeAgo}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : query.trim() ? (
            <View style={styles.emptyBox}>
              <MaterialIcons name="search-off" size={32} color="#CAC4D0" />
              <Text style={styles.emptyTitle}>No reports found for "{query}"</Text>
              <Text style={styles.emptySub}>Try searching for "Council", "Transit", or "Water".</Text>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <MaterialIcons name="travel-explore" size={36} color="#D0BCFF" />
              <Text style={styles.emptyTitle}>Real-Time Truth Index</Text>
              <Text style={styles.emptySub}>Type a keyword or select a topic above to explore ground dispatches.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDF7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1C1B1F',
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelBtnText: {
    color: '#6750A4',
    fontSize: 13,
    fontWeight: '700',
  },
  tagsContainer: {
    gap: 6,
  },
  tagsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#79747E',
    letterSpacing: 0.6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#FEF7FF',
    borderWidth: 1,
    borderColor: '#E7E0EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTagChip: {
    backgroundColor: '#21005D',
    borderColor: '#21005D',
  },
  tagChipText: {
    fontSize: 11,
    color: '#49454F',
    fontWeight: '600',
  },
  activeTagChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#6750A4',
  },
  resultsList: {
    gap: 10,
    paddingVertical: 6,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFF4',
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  resultPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EADDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6750A4',
    letterSpacing: 0.5,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1B20',
    lineHeight: 18,
  },
  resultMeta: {
    fontSize: 11,
    color: '#79747E',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1B20',
  },
  emptySub: {
    fontSize: 12,
    color: '#79747E',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
