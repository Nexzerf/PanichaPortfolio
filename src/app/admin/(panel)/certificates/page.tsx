import { requireOwner } from "@/lib/admin";
import { Card, PageHeader } from "@/components/admin/ui";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("certificates").select("*").order("sort_order");
  return (
    <>
      <PageHeader
        title="Certificates"
        description="เกียรติบัตร — อัปโหลดรูปเกียรติบัตร (หรือวางลิงก์ Google Drive) พร้อมคำอธิบายสั้น ๆ ลากเพื่อเรียงลำดับบนหน้าเว็บ"
      />
      <Card>
        <CollectionEditor
          table="certificates"
          rows={data ?? []}
          titleKey="title"
          subtitleKeys={["issuer", "issued"]}
          statusField="title"
          thumbKey="image_url"
          addLabel="Add certificate"
          fields={[
            {
              kind: "media",
              name: "image_url",
              label: "Certificate image",
              media: "image",
              folder: "certificates",
              aspect: "aspect-[1.414/1]",
              hint: "รูปเกียรติบัตร (JPG / PNG / WebP) หรือวางลิงก์ Google Drive — แนะนำแนวนอน A4",
            },
            { kind: "bilingual", name: "title", label: "Title / ชื่อเกียรติบัตร" },
            { kind: "bilingual", name: "issuer", label: "Issued by / หน่วยงานที่มอบ" },
            { kind: "text", name: "issued", label: "Date / วันที่ได้รับ", placeholder: "March 2026" },
            { kind: "bilingual", name: "description", label: "Short description / คำอธิบายสั้น ๆ", multiline: true, rows: 3 },
            { kind: "media", name: "file_url", label: "PDF (optional)", media: "pdf", folder: "certificates" },
            { kind: "text", name: "credential_url", label: "Verification link (optional)", type: "url", placeholder: "https://" },
          ]}
        />
      </Card>
    </>
  );
}
