import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDoctorsByHospital } from "@/lib/actions/patient.actions";

interface DoctorState {
  selectedDoctor: string | null;
  doctors: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  selectedDoctor: null,
  doctors: [],
  loading: false,
  error: null,
};

// ✅ Async Thunk to Fetch Doctors
export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (hospitalId: string, { rejectWithValue }) => {
    try {
      const response = await getDoctorsByHospital(hospitalId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
