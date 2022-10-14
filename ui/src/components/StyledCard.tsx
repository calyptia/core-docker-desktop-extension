import MCard from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import { PropsWithChildren } from "react"

export type CardProps = {
    title: string
    subheader?: string
}

export default function StyledCard(props: PropsWithChildren<CardProps>) {
    return (
        <MCard elevation={0} sx={{ border: "1px solid rgba(63, 81, 181, 0.14)" }}>
            <CardHeader title={props.title} subheader={props.subheader} sx={{ bgcolor: "rgba(63, 81, 181, 0.08)" }} titleTypographyProps={{ color: "#0D3D61", fontSize: "20px", fontWeight: 700 }} subheaderTypographyProps={{ color: "#0D3D61", fontSize: "14px", mt: 1 }} />
            <CardContent sx={{ bgcolor: "white" }} children={props.children} />
        </MCard>
    )
}
