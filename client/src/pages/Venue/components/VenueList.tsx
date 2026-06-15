import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../../components/Table";
import Spinner from "../../../components/Spinner/Spinner";
import { Link } from "react-router-dom";
import type { VenueColumns } from "../../../interfaces/VenueInterface";
import { useEffect, useState, type FC } from "react";
import VenueService from "../../../services/VenueService";

interface VenueListProps {
    refreshKey: boolean;
}

const VenueList: FC<VenueListProps> = ({ refreshKey }) => {
    const [loadingVenues, setLoadingVenues] = useState(false);
    const [venues, setVenues] = useState<VenueColumns[]>([]);

    const handleLoadVenues = async () => {
        try {
            setLoadingVenues(true);

            const res = await VenueService.loadVenue();

            if (res.status === 200) {
                setVenues(res.data.venues);
            } else {
                console.error(
                    "Unexpected error status occured during loading venues:",
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected error occured during loading venues:",
                error
            );
        } finally {
            setLoadingVenues(false);
        }
    };

    useEffect(() => {
        handleLoadVenues();
    }, [refreshKey]);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900 shadow-lg">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        Venues
                    </h3>

                    <p className="text-sm text-gray-400">
                        Total: {venues.length} venue(s)
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-gray-950 text-gray-300 text-xs uppercase tracking-wider">
                        <TableCell isHeader className="px-5 py-4 text-center">
                            No.
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Venue
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Description
                        </TableCell>

                        <TableCell isHeader className="px-5 py-4 text-center">
                            Actions
                        </TableCell>
                    </TableHeader>

                    <TableBody className="text-sm">
                        {loadingVenues ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-10">
                                    <div className="flex justify-center">
                                        <Spinner size="md" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : venues.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-10 text-center text-gray-500"
                                >
                                    No venues found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            venues.map((venue, index) => (
                                <TableRow
                                    key={venue.venue_id}
                                    className="
                                        border-t border-gray-800
                                        hover:bg-gray-800/50
                                        transition-colors
                                    "
                                >
                                    <TableCell className="px-5 py-4 text-center text-gray-300">
                                        {index + 1}
                                    </TableCell>

                                    <TableCell className="px-5 py-4 text-center font-medium text-white">
                                        {venue.venue_name}
                                    </TableCell>

                                    <TableCell className="px-5 py-4 text-center text-gray-400">
                                        {venue.venue_description || "-"}
                                    </TableCell>

                                    <TableCell className="px-5 py-4">
                                        <div className="flex justify-center gap-3">
                                            <Link
                                                to={`/venue/edit/${venue.venue_id}`}
                                                className="
                                                    rounded-lg
                                                    bg-blue-500/10
                                                    px-3 py-1.5
                                                    text-sm
                                                    font-medium
                                                    text-blue-400
                                                    hover:bg-blue-500/20
                                                "
                                            >
                                                Edit
                                            </Link>

                                            <Link
                                                to={`/venue/delete/${venue.venue_id}`}
                                                className="
                                                    rounded-lg
                                                    bg-red-500/10
                                                    px-3 py-1.5
                                                    text-sm
                                                    font-medium
                                                    text-red-400
                                                    hover:bg-red-500/20
                                                "
                                            >
                                                Delete
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default VenueList;