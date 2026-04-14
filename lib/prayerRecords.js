import { supabase } from '@/lib/supabase';
import { PRAYERS, migrateLegacyPrayerData } from '@/lib/prayers';

const TABLE_NAME = 'prayer_records';
const VALID_STATUSES = new Set(['done', 'qaza']);

function normalizeDayRecord(dayRecord = {}) {
  return PRAYERS.reduce((accumulator, prayer) => {
    const value = dayRecord?.[prayer.key];

    if (VALID_STATUSES.has(value)) {
      accumulator[prayer.key] = value;
    }

    return accumulator;
  }, {});
}

export function normalizePrayerData(data = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  return Object.entries(data).reduce((accumulator, [dateKey, dayRecord]) => {
    const normalizedDayRecord = normalizeDayRecord(dayRecord);

    if (Object.keys(normalizedDayRecord).length > 0) {
      accumulator[dateKey] = normalizedDayRecord;
    }

    return accumulator;
  }, {});
}

function rowsToPrayerData(rows = []) {
  return rows.reduce((accumulator, row) => {
    accumulator[row.date_key] = normalizeDayRecord(row.prayers);
    return accumulator;
  }, {});
}

function prayerDataToRows(userId, prayerData) {
  return Object.entries(normalizePrayerData(prayerData)).map(([dateKey, dayRecord]) => ({
    user_id: userId,
    date_key: dateKey,
    prayers: dayRecord,
  }));
}

export async function fetchPrayerData(userId) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('date_key, prayers')
    .eq('user_id', userId)
    .order('date_key', { ascending: true });

  if (error) throw error;

  return rowsToPrayerData(data);
}

export async function savePrayerDay(userId, dateKey, dayRecord) {
  const normalizedDayRecord = normalizeDayRecord(dayRecord);

  if (Object.keys(normalizedDayRecord).length === 0) {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('date_key', dateKey);

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(
      {
        user_id: userId,
        date_key: dateKey,
        prayers: normalizedDayRecord,
      },
      { onConflict: 'user_id,date_key' }
    );

  if (error) throw error;
}

export async function replacePrayerData(userId, prayerData) {
  const normalizedPrayerData = normalizePrayerData(prayerData);
  const rows = prayerDataToRows(userId, normalizedPrayerData);

  if (rows.length === 0) {
    const { error: deleteAllError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId);

    if (deleteAllError) throw deleteAllError;

    return {};
  }

  const { error: upsertError } = await supabase
    .from(TABLE_NAME)
    .upsert(rows, { onConflict: 'user_id,date_key' });

  if (upsertError) throw upsertError;

  const incomingDateKeys = rows.map((row) => row.date_key);

  const { data: existingRows, error: fetchExistingError } = await supabase
    .from(TABLE_NAME)
    .select('date_key')
    .eq('user_id', userId);

  if (fetchExistingError) throw fetchExistingError;

  const staleDateKeys = (existingRows || [])
    .map((row) => row.date_key)
    .filter((dateKey) => !incomingDateKeys.includes(dateKey));

  if (staleDateKeys.length > 0) {
    const { error: deleteStaleError } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .in('date_key', staleDateKeys);

    if (deleteStaleError) throw deleteStaleError;
  }

  return normalizedPrayerData;
}

export async function migrateLegacyPrayerDataToSupabase(userId) {
  const legacyPrayerData = normalizePrayerData(migrateLegacyPrayerData(userId));

  if (Object.keys(legacyPrayerData).length === 0) {
    return {};
  }

  await replacePrayerData(userId, legacyPrayerData);

  return legacyPrayerData;
}
