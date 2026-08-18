import { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import { FileOrigin, type FilePondFile, type FilePondInitialFile } from "filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { getStorageImageUrl } from "../firebase/queries/storage";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

interface ImagePickerPropsInterface {
  propertyId?: string;
  existingPhotos?: string[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting?: (fileName: string) => void;
}

// react-filepond treats `files` as controlled: it re-applies this prop to the
// pond on every re-render of the parent form (every keystroke). Mirroring the
// pond's own current items back into it (via onupdatefiles) keeps that re-apply
// a no-op; a frozen/empty array here would wipe out newly added files on the
// next unrelated re-render.
function toFilesProp(item: FilePondFile): FilePondInitialFile | File {
  return item.origin === FileOrigin.LOCAL
    ? { source: item.source as string, options: { type: "local" } }
    : (item.file as File);
}

export default function ImagePicker({
  propertyId,
  existingPhotos = [],
  onFilesChange,
  onRemoveExisting,
}: ImagePickerPropsInterface) {
  const [files, setFiles] = useState<Array<FilePondInitialFile | File>>(() =>
    existingPhotos.map((photo) => ({
      source: photo,
      options: { type: "local" },
    })),
  );

  return (
    <FilePond
      files={files}
      allowMultiple
      allowReorder
      instantUpload={false}
      acceptedFileTypes={["image/*"]}
      labelIdle='Arrastra tus fotos o <span class="filepond--label-action">selecciónalas</span>'
      server={
        propertyId
          ? {
              load: (source, load, error, _progress, abort) => {
                fetch(
                  getStorageImageUrl(`casas/${propertyId}/images/${source}`),
                )
                  .then((res) => res.blob())
                  .then(load)
                  .catch(() => error("No se pudo cargar la imagen"));
                return { abort };
              },
            }
          : undefined
      }
      onupdatefiles={(items: FilePondFile[]) => {
        setFiles(items.map(toFilesProp));
        onFilesChange(
          items
            .filter((item) => item.origin !== FileOrigin.LOCAL)
            .map((item) => item.file as File),
        );
      }}
      onremovefile={(_error, item: FilePondFile) => {
        if (item.origin === FileOrigin.LOCAL && onRemoveExisting) {
          onRemoveExisting(item.source as string);
        }
      }}
    />
  );
}
