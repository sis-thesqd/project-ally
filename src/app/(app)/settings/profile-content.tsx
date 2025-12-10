"use client";

import { useState } from "react";
import { Mail01 } from "@untitledui/icons";
import type { FileListItemProps } from "@/components/application/file-upload/file-upload-base";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { SectionHeader } from "@/components/application/section-headers/section-headers";
import { SectionLabel } from "@/components/application/section-headers/section-label";
import { Avatar } from "@/components/base/avatar/avatar";
import { Form } from "@/components/base/form/form";
import { InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { TextEditor } from "@/components/base/text-editor/text-editor";
import { countriesOptions } from "@/utils/countries";
import { timezonesOptionsWithLongName } from "@/utils/timezones";

const placeholderFiles: FileListItemProps[] = [
    {
        name: "Tech design requirements.pdf",
        type: "pdf",
        size: 200 * 1024,
        progress: 100,
    },
    {
        name: "Dashboard recording.mp4",
        type: "mp4",
        size: 1600 * 1024,
        progress: 40,
    },
    {
        name: "Dashboard prototype FINAL.fig",
        type: "fig",
        failed: false,
        size: 4200 * 1024,
        progress: 80,
    },
];

export function ProfileContent() {
    const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);

    const handleAvatarUpload = (file: File) => {
        console.log("File uploaded:", file);
        setUploadedAvatar(URL.createObjectURL(file));
    };

    return (
        <Form
            className="flex flex-col gap-6 px-4 lg:px-8"
            onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                console.log("Form data:", data);
            }}
        >

            {/* Form content */}
            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root isRequired size="sm" title="Name" className="max-lg:hidden" />

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                        <TextField isRequired name="firstName" defaultValue="Olivia">
                            <Label className="lg:hidden">First name</Label>
                            <InputBase size="md" />
                        </TextField>
                        <TextField isRequired name="lastName" defaultValue="Rhye">
                            <Label className="lg:hidden">Last name</Label>
                            <InputBase size="md" />
                        </TextField>
                    </div>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root isRequired size="sm" title="Email address" className="max-lg:hidden" />

                    <TextField isRequired name="email" type="email" defaultValue="olivia@untitledui.com">
                        <Label className="lg:hidden">Email address</Label>
                        <InputBase size="md" icon={Mail01} />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root
                        isRequired
                        size="sm"
                        title="Your photo"
                        description="This will be displayed on your profile."
                        tooltip="This is tooltip"
                    />
                    <div className="flex flex-col gap-5 lg:flex-row">
                        <Avatar size="2xl" src={uploadedAvatar || "https://www.untitledui.com/images/avatars/olivia-rhye?fm=webp&q=80"} />

                        <FileUpload.DropZone className="w-full" onDropFiles={(files) => handleAvatarUpload(files[0])} />
                    </div>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root size="sm" title="Role" className="max-lg:hidden" />

                    <TextField name="role" defaultValue="Product Designer">
                        <Label className="lg:hidden">Role</Label>
                        <InputBase size="md" />
                    </TextField>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root size="sm" title="Country" className="max-lg:hidden" />

                    <Select name="country" label="Country" size="md" defaultSelectedKey="AU" className="lg:label:hidden" items={countriesOptions}>
                        {(item) => (
                            <Select.Item id={item.id} icon={item.icon}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root size="sm" title="Timezone" tooltip="This is tooltip" className="max-lg:hidden" />

                    <Select
                        name="timezone"
                        label="Timezone"
                        size="md"
                        tooltip="This is a tooltip"
                        className="lg:label:hidden"
                        defaultSelectedKey={timezonesOptionsWithLongName.find((item) => item.label?.includes("PST"))?.id}
                        items={timezonesOptionsWithLongName}
                    >
                        {(item) => (
                            <Select.Item id={item.id} avatarUrl={item.avatarUrl} supportingText={item.supportingText} icon={item.icon}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root isRequired size="sm" title="Bio" description="Write a short introduction." />

                    <TextEditor.Root
                        limit={400}
                        className="gap-2"
                        inputClassName="min-h-70 p-4 resize-y"
                        content="I'm a Product Designer based in Melbourne, Australia. I specialize in UX/UI design, brand strategy, and Webflow development."
                    >
                        <TextEditor.Toolbar floating type="simple" />

                        <div className="flex flex-col gap-1.5">
                            <TextEditor.Content />
                            <TextEditor.HintText />
                        </div>
                    </TextEditor.Root>
                </div>

                <hr className="h-px w-full border-none bg-border-secondary" />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(200px,280px)_minmax(400px,512px)] lg:gap-8">
                    <SectionLabel.Root size="sm" title="Portfolio projects" description="Share a few snippets of your work." />

                    <FileUpload.Root>
                        <FileUpload.DropZone />

                        <FileUpload.List>
                            {placeholderFiles.map((file) => (
                                <FileUpload.ListItemProgressBar key={file.name} {...file} size={file.size} />
                            ))}
                        </FileUpload.List>
                    </FileUpload.Root>
                </div>
            </div>
        </Form>
    );
}

