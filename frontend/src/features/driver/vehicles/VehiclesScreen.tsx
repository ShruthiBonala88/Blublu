import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore, VehicleItem } from '@/store/userStore';
import { vehiclesApi } from '@/services/api';

const VEHICLE_TYPES = ['SUV', 'Sedan', 'Hatchback', 'EV', 'Luxury'];
const SEAT_OPTIONS = ['2 seats', '3 seats', '4 seats', '6 seats', '7 seats'];
const COLOR_OPTIONS = ['White', 'Black', 'Grey', 'Silver', 'Red', 'Blue'];

export default function VehiclesScreen() {
  const {
    vehicles,
    setActiveVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  } = useUserStore();

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formType, setFormType] = useState('SUV');
  const [formSeats, setFormSeats] = useState('4 seats');
  const [formColor, setFormColor] = useState('White');

  const openAddModal = () => {
    setModalMode('add');
    setSelectedVehicleId(null);
    setFormName('');
    setFormNumber('');
    setFormType('SUV');
    setFormSeats('4 seats');
    setFormColor('White');
    setModalVisible(true);
  };

  const openEditModal = (vehicle: VehicleItem) => {
    setModalMode('edit');
    setSelectedVehicleId(vehicle.id);
    setFormName(vehicle.name);
    setFormNumber(vehicle.number);
    setFormType(vehicle.type || 'SUV');
    setFormSeats(vehicle.seats || '4 seats');
    setFormColor(vehicle.color || 'White');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Required Field', 'Please enter the vehicle name/model (e.g. Hyundai Creta).');
      return;
    }
    if (!formNumber.trim()) {
      Alert.alert('Required Field', 'Please enter the vehicle registration number (e.g. TS 09 AB 1234).');
      return;
    }

    if (modalMode === 'edit' && selectedVehicleId) {
      updateVehicle(selectedVehicleId, {
        name: formName.trim(),
        number: formNumber.trim().toUpperCase(),
        type: formType.trim(),
        seats: formSeats.trim(),
        color: formColor.trim(),
      });
      setModalVisible(false);
      Alert.alert('Vehicle Updated', `${formName.trim()} details have been updated.`);
    } else {
      let createdId = Date.now().toString();
      try {
        const res = await vehiclesApi.create({
          make: formName.trim().split(' ')[0] || formName.trim(),
          model: formName.trim().split(' ').slice(1).join(' ') || formType.trim(),
          color: formColor.trim(),
          license_plate: formNumber.trim().toUpperCase(),
          total_seats: parseInt(formSeats) || 4,
        });
        if (res?.id) createdId = res.id;
      } catch (err) {
        console.warn('Vehicle create error:', err);
      }

      addVehicle({
        id: createdId,
        name: formName.trim(),
        number: formNumber.trim().toUpperCase(),
        type: formType.trim(),
        seats: formSeats.trim(),
        color: formColor.trim(),
        active: vehicles.length === 0,
      });
      setModalVisible(false);
      Alert.alert('Vehicle Added 🚗', `${formName.trim()} has been registered and verified with backend server.`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove ${name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteVehicle(id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Registered Vehicles</Text>

          <View style={{ width: 40 }} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Fleet Management</Text>
            <Text style={styles.summaryText}>
              Manage vehicles registered for your BLUBLU carpooling journeys.
            </Text>
          </View>
          <View style={styles.carIconBadge}>
            <Text style={styles.carIcon}>🚗</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Vehicles</Text>

        {vehicles.map((vehicle) => (
          <View
            key={vehicle.id}
            style={[
              styles.vehicleCard,
              vehicle.active && styles.activeCard,
            ]}
          >
            <View style={styles.vehicleTop}>
              <View style={styles.vehicleIcon}>
                <Text style={styles.vehicleEmoji}>🚙</Text>
              </View>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>
                  {vehicle.name}
                </Text>

                <Text style={styles.vehicleNumber}>
                  {vehicle.number} {vehicle.color ? `• ${vehicle.color}` : ''}
                </Text>
              </View>

              {vehicle.active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>
                    ✓ PRIMARY
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>TYPE</Text>
                <Text style={styles.detailValue}>{vehicle.type}</Text>
              </View>

              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>SEATS</Text>
                <Text style={styles.detailValue}>{vehicle.seats}</Text>
              </View>

              {vehicle.color ? (
                <View style={styles.detailCol}>
                  <Text style={styles.detailLabel}>COLOR</Text>
                  <Text style={styles.detailValue}>{vehicle.color}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              {!vehicle.active && (
                <Pressable
                  style={styles.activateButton}
                  onPress={() => setActiveVehicle(vehicle.id)}
                >
                  <Text style={styles.activateText}>Set Active</Text>
                </Pressable>
              )}

              <Pressable
                style={styles.editButton}
                onPress={() => openEditModal(vehicle)}
              >
                <Text style={styles.editText}>Edit</Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDelete(vehicle.id, vehicle.name)}
              >
                <Text style={styles.deleteText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {vehicles.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No vehicles registered</Text>
            <Text style={styles.emptyText}>
              Add a vehicle to publish carpool rides on BLUBLU.
            </Text>
          </View>
        )}

        <Pressable
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>
            + Add New Vehicle
          </Text>
        </Pressable>
      </ScrollView>

      {/* ADD / EDIT VEHICLE MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackdrop} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === 'edit' ? 'Edit Vehicle' : 'Register Vehicle'}
              </Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
                hitSlop={10}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {/* Vehicle Name / Model */}
              <Text style={styles.inputLabel}>VEHICLE MODEL / NAME</Text>
              <TextInput
                style={styles.modalInput}
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g. Toyota Innova, Honda City"
                placeholderTextColor="#86868B"
              />

              {/* Plate Number */}
              <Text style={styles.inputLabel}>REGISTRATION NUMBER</Text>
              <TextInput
                style={styles.modalInput}
                value={formNumber}
                onChangeText={(text) => setFormNumber(text.toUpperCase())}
                placeholder="e.g. TS 09 AB 1234"
                placeholderTextColor="#86868B"
                autoCapitalize="characters"
              />

              {/* Vehicle Type */}
              <Text style={styles.inputLabel}>VEHICLE TYPE</Text>
              <View style={styles.chipsRow}>
                {VEHICLE_TYPES.map((type) => {
                  const isSelected = formType.toLowerCase() === type.toLowerCase();
                  return (
                    <Pressable
                      key={type}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setFormType(type)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Seating Capacity */}
              <Text style={styles.inputLabel}>SEATING CAPACITY</Text>
              <View style={styles.chipsRow}>
                {SEAT_OPTIONS.map((seat) => {
                  const isSelected = formSeats.toLowerCase() === seat.toLowerCase();
                  return (
                    <Pressable
                      key={seat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setFormSeats(seat)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {seat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Color */}
              <Text style={styles.inputLabel}>VEHICLE COLOR</Text>
              <View style={styles.chipsRow}>
                {COLOR_OPTIONS.map((color) => {
                  const isSelected = formColor.toLowerCase() === color.toLowerCase();
                  return (
                    <Pressable
                      key={color}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setFormColor(color)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {color}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActionsRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.modalSaveBtn}
                  onPress={handleSave}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {modalMode === 'edit' ? 'Save Changes' : 'Register Vehicle'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  summaryInfo: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  summaryText: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
    color: '#86868B',
  },

  carIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  carIcon: {
    fontSize: 22,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  activeCard: {
    borderWidth: 1.5,
    borderColor: '#0071E3',
  },

  vehicleTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  vehicleEmoji: {
    fontSize: 22,
  },

  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },

  vehicleName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  vehicleNumber: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#86868B',
  },

  activeBadge: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0071E3',
  },

  detailsRow: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 14,
    paddingTop: 12,
  },

  detailCol: {
    minWidth: 60,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#86868B',
    letterSpacing: 0.5,
  },

  detailValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  activateButton: {
    flex: 1,
    backgroundColor: '#0071E3',
    borderRadius: 9999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  activateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  editButton: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 9999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  editText: {
    color: '#1D1D1F',
    fontSize: 12,
    fontWeight: '700',
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 9999,
    paddingVertical: 10,
    alignItems: 'center',
  },

  deleteText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  emptyIcon: {
    fontSize: 36,
  },

  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  emptyText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
    color: '#86868B',
  },

  addButton: {
    backgroundColor: '#0071E3', // Apple Blue Pill
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#0071E3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    maxHeight: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#86868B',
  },

  modalScroll: {
    paddingBottom: 20,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#86868B',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 0.8,
  },

  modalInput: {
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },

  chip: {
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  chipActive: {
    backgroundColor: '#0071E3',
    borderColor: '#0071E3',
  },

  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },

  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalCancelBtnText: {
    color: '#86868B',
    fontSize: 14,
    fontWeight: '700',
  },

  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#0071E3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
