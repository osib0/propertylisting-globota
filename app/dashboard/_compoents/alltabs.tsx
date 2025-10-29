'use client'
import { useState } from 'react';
import PropertyDetails from './property';
import { useAppContext } from '../../contextapi';
import Location from './location';
import PropertyAmenities from './propertyameneties';
import PropertyPhotos from './propertyphoto';
import RoomDetails from './roomdetails';
import SleepingArrangement from './sleeping';
import RoomAmenities from './roomamenities';
import RoomPhotos from './roomphoto';
import Documents from './document';
import OwnerDetails from './owenerdetail';
import ManageInventory from './inventory';
import { useSession } from 'next-auth/react';

const Alltabs = () => {
    const [shareData, setShareData] = useState<any>({});
    const { isTab } = useAppContext();
     const { data: session } = useSession();

    return (
        <> 
            {isTab == 'Property Details' && (<PropertyDetails setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Location' && (<Location setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Property Amenities' && (<PropertyAmenities setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Property Photos' && (<PropertyPhotos setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Details' && (<RoomDetails setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Sleeping Arrangement' && (<SleepingArrangement setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Amenities' && (<RoomAmenities setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Photos' && (<RoomPhotos setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Documents' && (<Documents setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Owner Details' && (<OwnerDetails setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Inventory' && (<ManageInventory propertyId={session?.user?.id} />)}
        </>
    )
}

export default Alltabs