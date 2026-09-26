'use client';
import { createContext, useContext } from 'react';
import { useTranslations } from 'next-intl';
import { CloudUpload, UploadIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DropEvent, DropzoneOptions, FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DropzoneContextType = {
  src?: File[];
  accept?: DropzoneOptions['accept'];
  maxSize?: DropzoneOptions['maxSize'];
  minSize?: DropzoneOptions['minSize'];
  maxFiles?: DropzoneOptions['maxFiles'];
};
const renderBytes = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)}${units[unitIndex]}`;
};
const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);
export type DropzoneProps = Omit<DropzoneOptions, 'onDrop'> & {
  src?: File[];
  className?: string;
  onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => void;
  children?: ReactNode;
};
export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onError,
    disabled,
    onDrop: (acceptedFiles, fileRejections, event) => {
      if (fileRejections.length > 0) {
        const message = fileRejections.at(0)?.errors.at(0)?.message;
        onError?.(new Error(message));
        return;
      }
      onDrop?.(acceptedFiles, fileRejections, event);
    },
    ...props,
  });
  return (
    <DropzoneContext.Provider
      key={JSON.stringify(src)}
      value={{ src, accept, maxSize, minSize, maxFiles }}
    >
      <Button
        className={cn(
          'relative h-auto w-full flex-col overflow-hidden p-2',
          isDragActive && 'outline-none ring-1 ring-ring',
          className,
        )}
        disabled={disabled}
        type="button"
        variant="outline"
        {...getRootProps()}
      >
        <input {...getInputProps()} disabled={disabled} />
        {children}
      </Button>
    </DropzoneContext.Provider>
  );
};
const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
};
export type DropzoneContentProps = {
  children?: ReactNode;
  className?: string;
};
const maxLabelItems = 3;
export const DropzoneContent = ({ children, className }: DropzoneContentProps) => {
  const { src } = useDropzoneContext();
  if (!src) {
    return null;
  }
  if (children) {
    return children;
  }
  return <div className={cn('flex flex-col items-center justify-center', className)}></div>;
};
export type DropzoneEmptyStateProps = {
  children?: ReactNode;
  className?: string;
};
export const DropzoneEmptyState = ({ children, className }: DropzoneEmptyStateProps) => {
  const t = useTranslations('common');

  const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext();
  if (src) {
    return null;
  }
  if (children) {
    return children;
  }
  let caption = '';
  if (accept) {
    caption += 'Accepts ';
    caption += new Intl.ListFormat('en').format(Object.keys(accept));
  }
  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`;
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`;
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <CloudUpload
          className="text-primary"
          style={{ width: 30, height: 30 }}
        />
      </div> */}
      <p className="my-1 w-full truncate text-wrap font-medium text-sm">
        {`${t('forms.upload')} ${maxFiles ? `${t('forms.file')}` : `${t('forms.files')}`}`}
      </p>
      {/* <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        {t("forms.drag-and-drop")}
      </p>
      <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        {t("forms.max-file-num")}
        <span className="text-destructive">*</span>
      </p> */}
    </div>
  );
};
