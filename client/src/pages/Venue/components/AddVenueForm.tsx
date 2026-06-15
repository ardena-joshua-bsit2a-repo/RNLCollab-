import { useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import SubmitButton from "../../../components/Button/SubmitButton";
import VenueService from "../../../services/VenueService";
import type { VenueFieldErrors } from "../../../interfaces/VenueInterface";

interface AddVenueFormProps {
    onVenueAdded: (message: string) => void;
    refreshKey: () => void;
}

const AddVenueForm: FC<AddVenueFormProps> = ({
    onVenueAdded,
    refreshKey,
}) => {
    const [loadingStore, setLoadingStore] = useState(false);
    const [venue, setVenue] = useState("");
    const [venueDescription, setVenueDescription] = useState("");
    const [errors, setErrors] = useState<VenueFieldErrors>({});

    const handleStoreVenue = async (e: FormEvent) => {
        e.preventDefault();

        try {
            setLoadingStore(true);

            const res = await VenueService.storeVenue({
                venue,
                venue_description: venueDescription,
            });

            if (res.status === 200) {
                setVenue("");
                setVenueDescription("");
                setErrors({});

                onVenueAdded(res.data.message);
                refreshKey();
            } else {
                console.error("Unexpected error occurred during storing venue.");
            }
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(
                    "Unexpected server error occurred during storing venue:",
                    error
                );
            }
        } finally {
            setLoadingStore(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                    Venue Management
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                    Create and manage venues where events and activities take place.
                    Each venue can be assigned to bookings and schedules.
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-6">
                    Enter Venue Information
                </h3>

                <form onSubmit={handleStoreVenue} className="space-y-5">

                    {/* Venue Name */}
                    <FloatingLabelInput
                        label="Venue"
                        type="text"
                        name="venue"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required
                        autoFocus
                        errors={errors.venue}
                    />

                    {/* Venue Description */}
                    <FloatingLabelInput
                        label="Description"
                        type="text"
                        name="venue_description"
                        value={venueDescription}
                        onChange={(e) =>
                            setVenueDescription(e.target.value)
                        }
                        errors={errors.venue_description}
                    />

                    {/* Submit */}
                    <div className="pt-2">
                        <SubmitButton
                            label="Save Venue"
                            loading={loadingStore}
                            loadingLabel="Saving Venue..."
                        />
                    </div>

                </form>
            </div>

        </div>
    );
};

export default AddVenueForm;