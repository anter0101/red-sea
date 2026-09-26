// import React, { useState } from "react";
// import {
//   Dropzone,
//   DropzoneContent,
//   DropzoneEmptyState,
// } from "@/components/ui/dropzone";
// import { Button } from "../ui/button";
// import { Trash } from "lucide-react";
// import { useCreatePresignedUrl } from "@/hooks/uploadS3/create-presigned-url";
// import { putPresignedUrl } from "@/hooks/uploadS3/put-presigned-url";
// import { IFileSystem } from "@/types/system-item-types";

// type Props = {
//   setUploadedFileData: (file: IFileSystem) => void;
//   onChange: (file: File) => void;
// };
// export default function Uploadzone({ setUploadedFileData, onChange }: Props) {
//   const [file, setFile] = useState<File | null>(null);

//   const { mutate: createPresignedUrl } = useCreatePresignedUrl();

//   const handleDropzoneChange = (file: File) => {
//     setFile(file);
//     onChange(file);

//     const fileData = {
//       //data sent to presigned url endpoint
//       name: file.name,
//       size: file.size,
//       type: file.type,
//     };

//     createPresignedUrl(fileData as File, {
//       onSuccess: (uploadedFile: IFileSystem) => {
//         setUploadedFileData(uploadedFile);
//         putPresignedUrl({ fileUrl: uploadedFile.url, file });
//       },
//       onError: (err) => {
//         console.error("Upload failed:", err);
//       },
//     });
//   };

//   return (
//     <div>
//       {file === null && (
//         <Dropzone
//           accept={{ "image/*": [], "application/pdf": [] }}
//           onDrop={(acceptedFiles: File[]) => {
//             setFile(acceptedFiles[0]);
//             handleDropzoneChange(acceptedFiles[0]);
//             onChange(acceptedFiles[0]);
//           }}
//           maxFiles={1}
//         >
//           <DropzoneEmptyState />
//           <DropzoneContent />
//         </Dropzone>
//       )}

//       {file !== null && (
//         <div className="flex items-center justify-between p-2 border rounded-md">
//           <span className="truncate">{file.name}</span>
//           <Button size="sm" variant="outline" onClick={() => setFile(null)}>
//             <Trash size={16} />
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
