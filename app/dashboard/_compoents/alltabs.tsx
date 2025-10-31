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
import { redirect } from 'next/navigation';

const Alltabs = () => {
    const [shareData, setShareData] = useState<any>({});
    const { isTab,isListingData ,isAprove} = useAppContext();
    const { data: session } = useSession();
     
    if (isAprove) {
        redirect('/dashboard/basic-info')
    }

    return (
        <> 
            {isTab == 'Property Details' && (<PropertyDetails defaultData={isListingData?.property_detail} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Location' && (<Location defaultData={isListingData?.location} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Property Amenities' && (<PropertyAmenities defaultData={isListingData?.property_amenities} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Property Photos' && (<PropertyPhotos defaultData={isListingData?.property_photos} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Details' && (<RoomDetails defaultData={isListingData?.room_detail} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Sleeping Arrangement' && (<SleepingArrangement defaultData={isListingData?.sleepingArrangement} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Amenities' && (<RoomAmenities defaultData={isListingData?.room_amenities} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Room Photos' && (<RoomPhotos defaultData={isListingData?.room_photos} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Documents' && (<Documents  defaultData={isListingData?.documents} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Owner Details' && (<OwnerDetails defaultData={isListingData?.owner_details} setShareData={setShareData} shareData={shareData} />)}
            {isTab == 'Inventory' && (<ManageInventory propertyId={session?.user?.id} />)}
        </>
    )
}

export default Alltabs