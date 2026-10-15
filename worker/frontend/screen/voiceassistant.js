import React from 'react'; 
import { 
  SafeAreaView, 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
 
export default function Voiceassistant({ onBack }) { 
  return ( 
    <SafeAreaView style={styles.container}> 
 
      {/* HEADER */} 
      <View style={styles.header}> 
 
        <Pressable 
          style={({ pressed }) => [ 
            styles.backButton, 
            pressed && styles.pressed, 
          ]} 
          onPress={onBack} 
        > 
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="#111827" 
          /> 
        </Pressable> 
 
        <Text style={styles.headerTitle}> 
          Voice Assistant 
        </Text> 
 
        <View style={styles.headerSpace} /> 
 
      </View> 
 
      {/* CONTENT */} 
      <View style={styles.content}> 
 
        {/* MICROPHONE CIRCLE */} 
        <View style={styles.micOuterCircle}> 
 
          <View style={styles.micCircle}> 
 
            <Ionicons 
              name="mic" 
              size={58} 
              color="#FFFFFF" 
            /> 
 
          </View> 
 
        </View> 
 
        {/* TITLE */} 
        <Text style={styles.title}> 
          Sahayak Voice Assistant 
        </Text> 
 
        {/* DESCRIPTION */} 
        <Text style={styles.subtitle}> 
          Talk to Sahayak and get help with your 
          home service bookings. 
        </Text> 
 
        {/* COMING SOON CARD */} 
        <View style={styles.comingSoonCard}> 
 
          <View style={styles.smallIcon}> 
            <Ionicons 
              name="sparkles-outline" 
              size={22} 
              color="#49769F" 
            /> 
          </View> 
 
          <View style={styles.cardTextContainer}> 
 
            <Text style={styles.comingSoonTitle}> 
              Coming Soon 
            </Text> 
 
            <Text style={styles.comingSoonText}> 
              Voice booking and multilingual assistance 
              will be available here soon. 
            </Text> 
 
          </View> 
 
        </View> 
 
        {/* SUPPORTED LANGUAGES */} 
        <View style={styles.languageRow}> 
 
          <View style={styles.languageIcon}> 
            <Ionicons 
              name="language-outline" 
              size={19} 
              color="#49769F" 
            /> 
          </View> 
 
          <Text style={styles.languageText}> 
            English • मराठी • हिंदी 
          </Text> 
 
        </View> 
 
      </View> 
 
    </SafeAreaView> 
  ); 
} 
 
const styles = StyleSheet.create({ 
 
  /* CONTAINER */ 
 
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
  }, 
 
  /* HEADER */ 
 
  header: { 
    height: 65, 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB', 
  }, 
 
  backButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
  }, 
 
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827', 
  }, 
 
  headerSpace: { 
    width: 42, 
  }, 
 
  /* CONTENT */ 
 
  content: { 
    flex: 1, 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: 80, 
  }, 
 
  /* MICROPHONE */ 
 
  micOuterCircle: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    backgroundColor: '#E8F0F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
  }, 
 
  micCircle: { 
    width: 105, 
    height: 105, 
    borderRadius: 53, 
    backgroundColor: '#49769F', 
    justifyContent: 'center', 
    alignItems: 'center', 
 
    elevation: 5, 
 
    shadowColor: '#49769F', 
    shadowOffset: { 
      width: 0, 
      height: 5, 
    }, 
    shadowOpacity: 0.2, 
    shadowRadius: 10, 
  }, 
 
  /* TITLE */ 
 
  title: { 
    marginTop: 28, 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center', 
  }, 
 
  subtitle: { 
    marginTop: 10, 
    fontSize: 14, 
    lineHeight: 21, 
    color: '#6B7280', 
    textAlign: 'center', 
    maxWidth: 310, 
  }, 
 
  /* COMING SOON CARD */ 
 
  comingSoonCard: { 
    width: '100%', 
    marginTop: 35, 
    padding: 16, 
 
    backgroundColor: '#F0F5F8', 
 
    borderRadius: 18, 
    borderWidth: 1, 
    borderColor: '#D9E4EC', 
 
    flexDirection: 'row', 
    alignItems: 'center', 
  }, 
 
  smallIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
  }, 
 
  cardTextContainer: { 
    flex: 1, 
    marginLeft: 13, 
  }, 
 
  comingSoonTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#111827', 
  }, 
 
  comingSoonText: { 
    fontSize: 12, 
    lineHeight: 18, 
    color: '#6B7280', 
    marginTop: 4, 
  }, 
 
  /* LANGUAGES */ 
 
  languageRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 22, 
  }, 
 
  languageIcon: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    backgroundColor: '#E8F0F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
  }, 
 
  languageText: { 
    marginLeft: 9, 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748B', 
  }, 
 
  /* PRESS */ 
 
  pressed: { 
    opacity: 0.7, 
  }, 
 
}); 
