import React, { useEffect, useRef, useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useSpeechToText } from '../utils/useSpeechToText';
import { translate, translateService } from '../utils/translations';


// =====================================================
// COLORS
// =====================================================

const COLORS = {
  blue: '#49769F',
  dark: '#1F2937',
  gray: '#64748B',
  lightGray: '#94A3B8',
  white: '#FFFFFF',
  background: '#F7FAFC',
  border: '#E2E8F0',
  softBlue: '#EAF3FA',
  green: '#22C55E',
  red: '#EF4444',
};


// =====================================================
// MIC BUTTON
// Same style as the search engine mic.
// Rendered OUTSIDE the screen to avoid focus loss.
// =====================================================

function MicButton({ active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.voiceButton,
        active && styles.voiceButtonActive,
      ]}
    >
      <Ionicons
        name="mic-outline"
        size={19}
        color={active ? COLORS.white : COLORS.blue}
      />
    </Pressable>
  );
}


// =====================================================
// SERVICE REQUEST SCREEN
// =====================================================

export default function Servicerequestscreen({
  selectedService,
  onBack,
  onSearchWorker,
  language = "english",
}) {

  // ===================================================
  // FORM STATES
  // ===================================================

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [workDescription, setWorkDescription] = useState('');

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [image, setImage] = useState(null);


  // ===================================================
  // SPEECH TO TEXT
  // ===================================================

  const {
    start,
    stop,
    reset,
    listening,
    transcript,
  } = useSpeechToText(language);

  const activeVoiceField = useRef(null);
  const [voiceField, setVoiceField] =
    useState(null);

  const handleVoice = (field) => {
    activeVoiceField.current = field;
    setVoiceField(field);
    reset();
    start();
  };

  useEffect(() => {

    if (!transcript || listening) {
      return;
    }

    const field = activeVoiceField.current;

    if (!field) {
      return;
    }

    if (field === 'name') {
      setName(transcript);
    } else if (
      field === 'workDescription'
    ) {
      setWorkDescription(transcript);
    }

    activeVoiceField.current = null;
    setVoiceField(null);
    reset();

  }, [listening, transcript, reset]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);


  // ===================================================
  // LOCATION STATES
  // ===================================================

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [locationDetected, setLocationDetected] =
    useState(false);

  const [locationError, setLocationError] =
    useState('');

  const [latitude, setLatitude] =
    useState(null);

  const [longitude, setLongitude] =
    useState(null);


  // ===================================================
  // GET CURRENT LOCATION
  // ===================================================

  const getCurrentLocation = async () => {

    try {

      setLocationLoading(true);
      setLocationError('');
      setLocationDetected(false);

      // Request permission
      const {
        status,
      } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {

        setLocationLoading(false);

        setLocationError(
          translate(language, 'locationPermissionDenied')
        );

        Alert.alert(
          translate(language, 'locationPermissionTitle'),
          translate(language, 'locationPermissionMessage'),
          [
            {
              text: translate(language, 'ok'),
            },
          ]
        );

        return;
      }


      // Get current position
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });


      const {
        latitude: currentLatitude,
        longitude: currentLongitude,
      } = currentLocation.coords;


      // Save coordinates
      setLatitude(currentLatitude);
      setLongitude(currentLongitude);


      // Convert coordinates to address
      const addressResult =
        await Location.reverseGeocodeAsync({
          latitude: currentLatitude,
          longitude: currentLongitude,
        });


      if (
        addressResult &&
        addressResult.length > 0
      ) {

        const place =
          addressResult[0];


        const parts = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.subregion,
          place.region,
          place.postalCode,
        ].filter(Boolean);


        const formattedAddress =
          [...new Set(parts)].join(', ');


        if (
          formattedAddress.trim()
        ) {

          setAddress(
            formattedAddress
          );

          setLocationDetected(
            true
          );

        } else {

          setLocationError(
            translate(language, 'couldNotDetermineAddress')
          );

        }

      } else {

        setLocationError(
          translate(language, 'couldNotDetermineAddress')
        );

      }

    } catch (error) {

      console.log(
        'LOCATION ERROR:',
        error
      );


      setLocationError(
        translate(language, 'unableToDetectLocation')
      );


      Alert.alert(
        translate(language, 'locationErrorTitle'),
        translate(language, 'locationErrorMessage')
      );

    } finally {

      setLocationLoading(false);

    }

  };


  // ===================================================
  // GET LOCATION WHEN SCREEN OPENS
  // ===================================================

  useEffect(() => {

    getCurrentLocation();

  }, []);


  // ===================================================
  // DATE
  // ===================================================

  const handleDateChange = (
    event,
    date
  ) => {

    setShowDatePicker(false);

    if (date) {

      setSelectedDate(date);

    }

  };


  // ===================================================
  // TIME
  // ===================================================

  const handleTimeChange = (
    event,
    time
  ) => {

    setShowTimePicker(false);

    if (time) {

      setSelectedTime(time);

    }

  };


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (
    date
  ) => {

    if (!date) {

      return translate(language, 'selectDatePlaceholder');

    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );

  };


  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formatTime = (
    time
  ) => {

    if (!time) {

      return translate(language, 'selectTimePlaceholder');

    }

    return time.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );

  };


  // ===================================================
  // IMAGE PICKER
  // ===================================================

  const pickImage =
    async () => {

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();


      if (!permission.granted) {

        Alert.alert(
          translate(language, 'permissionRequiredTitle'),
          translate(language, 'galleryPermissionMessage')
        );

        return;

      }


      const result =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ['images'],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.8,

        });


      if (!result.canceled) {

        setImage(
          result.assets[0].uri
        );

      }

    };


  // ===================================================
  // SEARCH AVAILABLE WORKERS
  // ===================================================

  const handleSearchWorker =
    () => {

      // -------------------------------------------------
      // NAME VALIDATION
      // -------------------------------------------------

      if (!name.trim()) {

        Alert.alert(
          translate(language, 'nameRequiredTitle'),
          translate(language, 'nameRequiredMessage')
        );

        return;

      }


      // -------------------------------------------------
      // ADDRESS VALIDATION
      // -------------------------------------------------

      if (!address.trim()) {

        Alert.alert(
          translate(language, 'addressRequiredTitle'),
          translate(language, 'addressRequiredMessage')
        );

        return;

      }


      // -------------------------------------------------
      // DATE VALIDATION
      // -------------------------------------------------

      if (!selectedDate) {

        Alert.alert(
          translate(language, 'selectDateTitle'),
          translate(language, 'selectDateMessage')
        );

        return;

      }


      // -------------------------------------------------
      // TIME VALIDATION
      // -------------------------------------------------

      if (!selectedTime) {

        Alert.alert(
          translate(language, 'selectTimeTitle'),
          translate(language, 'selectTimeMessage')
        );

        return;

      }


      // -------------------------------------------------
      // DESCRIPTION VALIDATION
      // -------------------------------------------------

      if (!workDescription.trim()) {

        Alert.alert(
          translate(language, 'describeWorkTitle'),
          translate(language, 'describeWorkMessage')
        );

        return;

      }


      // =================================================
      // PREPARE BOOKING-READY DATA
      // =================================================

      const requestData = {

        // User
        name:
          name.trim(),


        // Service
        service:
          selectedService,


        // Address
        address:
          address.trim(),


        // Coordinates
        latitude:
          latitude,

        longitude:
          longitude,


        // Date object
        date:
          selectedDate,


        // Readable date
        dateText:
          formatDate(
            selectedDate
          ),


        // Time object
        time:
          selectedTime,


        // Readable time
        timeText:
          formatTime(
            selectedTime
          ),


        // Work details
        description:
          workDescription.trim(),


        // Uploaded image
        image:
          image,

      };


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        '================================='
      );

      console.log(
        'SERVICE REQUEST DATA:',
        requestData
      );

      console.log(
        'SERVICE:',
        requestData.service
      );

      console.log(
        'DATE:',
        requestData.dateText
      );

      console.log(
        'TIME:',
        requestData.timeText
      );

      console.log(
        'ADDRESS:',
        requestData.address
      );

      console.log(
        'LATITUDE:',
        requestData.latitude
      );

      console.log(
        'LONGITUDE:',
        requestData.longitude
      );

      console.log(
        '================================='
      );


      // =================================================
      // SEND TO APP.JS
      // =================================================

      if (
        typeof onSearchWorker ===
        'function'
      ) {

        onSearchWorker(
          requestData
        );

      }

    };


  // ===================================================
  // SCREEN
  // ===================================================

  return (

    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <Pressable
          style={styles.backButton}
          delayPressIn={0}
          onPress={onBack}
        >

          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.dark}
          />

        </Pressable>


        <View
          style={styles.headerText}
        >

          <Text
            style={styles.headerTitle}
          >
            {translate(language, 'serviceRequest')}
          </Text>


          <Text
            style={styles.headerSubtitle}
          >
            {translate(language, 'tellUsWhatYouNeed')}
          </Text>

        </View>

      </View>


      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* =================================================
            SELECTED SERVICE
        ================================================= */}

        <View
          style={styles.serviceCard}
        >

          <View
            style={styles.serviceIcon}
          >

            <Ionicons
              name="construct-outline"
              size={25}
              color={COLORS.blue}
            />

          </View>


          <View
            style={styles.serviceInfo}
          >

            <Text
              style={styles.smallLabel}
            >
              {translate(language, 'selectedServiceLabel')}
            </Text>


            <Text
              style={styles.serviceName}
            >
              {
                translateService(selectedService, language) ||
                translate(language, 'homeService')
              }
            </Text>

          </View>


          <Ionicons
            name="checkmark-circle"
            size={24}
            color={COLORS.green}
          />

        </View>


        {/* =================================================
            NAME
        ================================================= */}

        <View
          style={
            styles.labelRow
          }
        >

          <Text
            style={styles.sectionTitle}
          >
            {translate(language, 'yourName')}
          </Text>

          <MicButton
            active={
              voiceField === 'name'
            }
            onPress={() =>
              handleVoice('name')
            }
          />

        </View>


        <View
          style={styles.inputContainer}
        >

          <Ionicons
            name="person-outline"
            size={20}
            color={COLORS.gray}
          />


          <TextInput
            value={name}
            onChangeText={
              setName
            }
            placeholder={translate(language, 'enterYourNamePlaceholder')}
            placeholderTextColor={
              COLORS.lightGray
            }
            style={
              styles.input
            }
          />

        </View>


        {/* =================================================
            ADDRESS
        ================================================= */}

        <View
          style={
            styles.addressTitleRow
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            {translate(language, 'serviceAddress')}
          </Text>


          <Pressable
            onPress={
              getCurrentLocation
            }
            delayPressIn={0}
            style={
              styles.useLocationButton
            }
          >

            <Ionicons
              name="locate-outline"
              size={15}
              color={
                COLORS.blue
              }
            />


            <Text
              style={
                styles.useLocationText
              }
            >
              {translate(language, 'useMyLocation')}
            </Text>

          </Pressable>

        </View>


        <View
          style={[
            styles.inputContainer,
            styles.addressContainer,
          ]}
        >

          <Ionicons
            name="location-outline"
            size={21}
            color={
              locationDetected
                ? COLORS.green
                : COLORS.blue
            }
          />


          <TextInput
            value={
              address
            }
            onChangeText={
              (text) => {

                setAddress(
                  text
                );

                setLocationDetected(
                  false
                );

              }
            }
            placeholder={
              locationLoading
                ? translate(language, 'detectingLocationPlaceholder')
                : translate(language, 'enterServiceAddressPlaceholder')
            }
            placeholderTextColor={
              COLORS.lightGray
            }
            style={[
              styles.input,
              styles.addressInput,
            ]}
            multiline
          />

        </View>


        {/* =================================================
            LOCATION STATUS
        ================================================= */}

        {locationLoading && (

          <View
            style={
              styles.locationStatus
            }
          >

            <ActivityIndicator
              size="small"
              color={
                COLORS.blue
              }
            />


            <Text
              style={
                styles.locationStatusText
              }
            >
              {translate(language, 'detectingCurrentLocation')}
            </Text>

          </View>

        )}


        {!locationLoading &&
          locationDetected && (

            <View
              style={[
                styles.locationStatus,
                styles.locationSuccess,
              ]}
            >

              <Ionicons
                name="checkmark-circle"
                size={16}
                color={
                  COLORS.green
                }
              />


              <Text
                style={[
                  styles.locationStatusText,
                  {
                    color:
                      COLORS.green,
                  },
                ]}
              >
                {translate(language, 'currentLocationDetected')}
              </Text>

            </View>

        )}


        {!locationLoading &&
          locationError && (

            <View
              style={[
                styles.locationStatus,
                styles.locationError,
              ]}
            >

              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={
                  COLORS.red
                }
              />


              <Text
                style={[
                  styles.locationStatusText,
                  {
                    color:
                      COLORS.red,
                  },
                ]}
              >
                {locationError}
              </Text>

            </View>

        )}


        {/* =================================================
            DATE AND TIME
        ================================================= */}

        <Text
          style={[
            styles.sectionTitle,
            {
              marginTop: 20,
            },
          ]}
        >
          {translate(language, 'whenDoYouNeedService')}
        </Text>


        <View
          style={
            styles.dateTimeRow
          }
        >

          {/* DATE */}

          <Pressable
            style={
              styles.dateTimeBox
            }
            delayPressIn={0}
            onPress={() =>
              setShowDatePicker(
                true
              )
            }
          >

            <View
              style={
                styles.dateTimeIcon
              }
            >

              <Ionicons
                name="calendar-outline"
                size={21}
                color={
                  COLORS.blue
                }
              />

            </View>


            <View
              style={
                styles.dateTimeText
              }
            >

              <Text
                style={
                  styles.dateTimeLabel
                }
              >
                {translate(language, 'dateLabel')}
              </Text>


              <Text
                style={[
                  styles.dateTimeValue,

                  !selectedDate &&
                    styles.placeholderValue,
                ]}
              >
                {
                  formatDate(
                    selectedDate
                  )
                }
              </Text>

            </View>

          </Pressable>


          {/* TIME */}

          <Pressable
            style={
              styles.dateTimeBox
            }
            delayPressIn={0}
            onPress={() =>
              setShowTimePicker(
                true
              )
            }
          >

            <View
              style={
                styles.dateTimeIcon
              }
            >

              <Ionicons
                name="time-outline"
                size={21}
                color={
                  COLORS.blue
                }
              />

            </View>


            <View
              style={
                styles.dateTimeText
              }
            >

              <Text
                style={
                  styles.dateTimeLabel
                }
              >
                {translate(language, 'timeLabel')}
              </Text>


              <Text
                style={[
                  styles.dateTimeValue,

                  !selectedTime &&
                    styles.placeholderValue,
                ]}
              >
                {
                  formatTime(
                    selectedTime
                  )
                }
              </Text>

            </View>

          </Pressable>

        </View>


        {/* =================================================
            DATE PICKER
        ================================================= */}

        {showDatePicker && (

          <DateTimePicker
            value={
              selectedDate ||
              new Date()
            }
            mode="date"
            display="default"
            minimumDate={
              new Date()
            }
            onChange={
              handleDateChange
            }
          />

        )}


        {/* =================================================
            TIME PICKER
        ================================================= */}

        {showTimePicker && (

          <DateTimePicker
            value={
              selectedTime ||
              new Date()
            }
            mode="time"
            display="default"
            onChange={
              handleTimeChange
            }
          />

        )}


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <View
          style={
            styles.labelRow
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            {translate(language, 'describeTheWork')}
          </Text>

          <MicButton
            active={
              voiceField === 'workDescription'
            }
            onPress={() =>
              handleVoice('workDescription')
            }
          />

        </View>


        <View
          style={[
            styles.inputContainer,
            styles.descriptionContainer,
          ]}
        >

          <TextInput
            value={
              workDescription
            }
            onChangeText={
              setWorkDescription
            }
            placeholder={translate(language, 'tellUsWhatNeedsToBeDone')}
            placeholderTextColor={
              COLORS.lightGray
            }
            style={
              styles.descriptionInput
            }
            multiline
            textAlignVertical="top"
          />

        </View>


        {/* =================================================
            PHOTO
        ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          {translate(language, 'addPhotos')}
        </Text>


        <Text
          style={
            styles.uploadSubtitle
          }
        >
          {translate(language, 'photosHelpText')}
        </Text>


        <Pressable
          style={
            styles.uploadBox
          }
          delayPressIn={0}
          onPress={
            pickImage
          }
        >

          {image ? (

            <>

              <Image
                source={{
                  uri: image,
                }}
                style={
                  styles.uploadedImage
                }
              />


              <View
                style={
                  styles.changeImageOverlay
                }
              >

                <Ionicons
                  name="camera"
                  size={20}
                  color={
                    COLORS.white
                  }
                />


                <Text
                  style={
                    styles.changeImageText
                  }
                >
                  {translate(language, 'changePhoto')}
                </Text>

              </View>

            </>

          ) : (

            <>

              <View
                style={
                  styles.driveIconBox
                }
              >

                <Ionicons
                  name="cloud-upload-outline"
                  size={43}
                  color={
                    COLORS.blue
                  }
                />

              </View>


              <Text
                style={
                  styles.uploadTitle
                }
              >
                {translate(language, 'uploadAPhoto')}
              </Text>


              <Text
                style={
                  styles.uploadText
                }
              >
                {translate(language, 'tapToChooseFromGallery')}
              </Text>


              <View
                style={
                  styles.uploadButton
                }
              >

                <Ionicons
                  name="images-outline"
                  size={17}
                  color={
                    COLORS.blue
                  }
                />


                <Text
                  style={
                    styles.uploadButtonText
                  }
                >
                  {translate(language, 'choosePhoto')}
                </Text>

              </View>

            </>

          )}

        </Pressable>


        {/* =================================================
            SEARCH WORKER
        ================================================= */}

        <Pressable
          style={
            styles.searchWorkerButton
          }
          delayPressIn={0}
          onPress={
            handleSearchWorker
          }
        >

          <Ionicons
            name="search"
            size={20}
            color={
              COLORS.white
            }
          />


          <Text
            style={
              styles.searchWorkerText
            }
          >
            {translate(language, 'searchAvailableWorkers')}
          </Text>


          <Ionicons
            name="arrow-forward"
            size={20}
            color={
              COLORS.white
            }
          />

        </Pressable>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>

    </SafeAreaView>

  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor:
      COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },


  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor:
      '#F1F5F9',
    justifyContent:
      'center',
    alignItems: 'center',
    marginRight: 13,
  },


  headerText: {
    flex: 1,
  },


  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },


  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
  },


  // ===================================================
  // SCROLL
  // ===================================================

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },


  // ===================================================
  // SERVICE CARD
  // ===================================================

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.white,
    borderRadius: 18,
    padding: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },


  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
    marginRight: 12,
  },


  serviceInfo: {
    flex: 1,
  },


  smallLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.lightGray,
    letterSpacing: 1,
  },


  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 3,
  },


  // ===================================================
  // SECTION TITLE
  // ===================================================

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 9,
    marginTop: 4,
  },


  // ===================================================
  // VOICE BUTTON (same as search engine mic)
  // ===================================================

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor:
      COLORS.softBlue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor:
      '#D9E4F0',
    marginBottom: 9,
  },

  voiceButtonActive: {
    backgroundColor:
      COLORS.blue,
    borderColor:
      COLORS.blue,
  },


  // ===================================================
  // ADDRESS HEADER
  // ===================================================

  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 1,
  },


  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.softBlue,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 9,
  },


  useLocationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blue,
    marginLeft: 4,
  },


  // ===================================================
  // INPUT
  // ===================================================

  inputContainer: {
    minHeight: 52,
    backgroundColor:
      COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },


  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.dark,
  },


  addressContainer: {
    alignItems:
      'flex-start',
    paddingVertical: 12,
    marginBottom: 6,
  },


  addressInput: {
    minHeight: 45,
  },


  // ===================================================
  // LOCATION STATUS
  // ===================================================

  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },


  locationSuccess: {
    marginTop: 2,
  },


  locationError: {
    marginTop: 2,
  },


  locationStatusText: {
    fontSize: 11,
    color: COLORS.blue,
    marginLeft: 6,
  },


  // ===================================================
  // DATE + TIME
  // ===================================================

  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },


  dateTimeBox: {
    flex: 1,
    minHeight: 68,
    backgroundColor:
      COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },


  dateTimeIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
  },


  dateTimeText: {
    flex: 1,
    marginLeft: 9,
  },


  dateTimeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.lightGray,
    letterSpacing: 0.8,
  },


  dateTimeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 4,
  },


  placeholderValue: {
    color:
      COLORS.lightGray,
    fontWeight: '500',
  },


  // ===================================================
  // DESCRIPTION
  // ===================================================

  descriptionContainer: {
    height: 120,
    alignItems:
      'flex-start',
    paddingVertical: 13,
    marginBottom: 20,
  },


  descriptionInput: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    color: COLORS.dark,
  },


  // ===================================================
  // UPLOAD
  // ===================================================

  uploadSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: -4,
    marginBottom: 12,
  },


  uploadBox: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 300,
    backgroundColor:
      COLORS.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor:
      '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent:
      'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 22,
  },


  driveIconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor:
      COLORS.softBlue,
    justifyContent:
      'center',
    alignItems: 'center',
    marginBottom: 14,
  },


  uploadTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
  },


  uploadText: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 6,
  },


  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.softBlue,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 15,
  },


  uploadButtonText: {
    color: COLORS.blue,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },


  uploadedImage: {
    width: '100%',
    height: '100%',
  },


  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent:
      'center',
    alignItems: 'center',
  },


  changeImageText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },


  // ===================================================
  // SEARCH BUTTON
  // ===================================================

  searchWorkerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor:
      COLORS.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },


  searchWorkerText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    marginHorizontal: 10,
  },


  bottomSpace: {
    height: 25,
  },

});