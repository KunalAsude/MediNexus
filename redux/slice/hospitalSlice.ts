import { getAllHospitals } from "@/lib/actions/patient.actions";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";


interface HospitalState {
  selectedHospitalId: string | null;
  hospitals: any[];
  loading: boolean;
  error: string | null;
}

const initialState: HospitalState = {
  selectedHospitalId: null,
  hospitals: [],
  loading: false,
  error: null,
};

// ✅ Async Thunk to Fetch Hospitals
export const fetchHospitals = createAsyncThunk("hospital/fetchHospitals", async (_, { rejectWithValue }) => {
    try {
      const response = await getAllHospitals(); // Fetch hospitals from API
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const hospitalSlice = createSlice({
  name: "hospital",
  initialState,
  reducers: {
    setSelectedHospital: (state, action) => {
      state.selectedHospitalId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHospitals.fulfilled, (state, action) => {
        state.loading = false;
        state.hospitals = action.payload;
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedHospital } = hospitalSlice.actions;
export default hospitalSlice.reducer;
