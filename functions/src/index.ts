import {setGlobalOptions} from "firebase-functions";
import {initializeApp} from "firebase-admin/app";

initializeApp();
setGlobalOptions({maxInstances: 10});

export {sendHousePublishedEmail} from "./sendHousePublishedEmail";
export {checkPropertyAvailability} from "./checkPropertyAvailability";
export {confirmAvailability} from "./confirmAvailability";
export {processCasaImage} from "./processCasaImage";
export {deleteCasaImages} from "./deleteCasaImages";
