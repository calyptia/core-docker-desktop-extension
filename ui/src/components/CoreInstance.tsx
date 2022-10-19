import ErrorIcon from "@mui/icons-material/Error"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import Chip, { ChipTypeMap } from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import Grid from "@mui/material/Grid"
import LinearProgress from "@mui/material/LinearProgress"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useQuery } from "@tanstack/react-query"
import { useState } from 'react'
import { useCloudClient } from "../hooks/cloud"
import { useDockerDesktopClient } from "../hooks/docker-desktop"
import birdDarkSrc from "../images/bird-dark.svg"
import { CoreInstance as CoreInstanceType, CoreInstanceStatus } from "../lib/cloud"
import CoreInstanceMenu from "./CoreInstanceMenu"
import StyledCard from "./StyledCard"
import Vivo from "./Vivo"

type Props = {
    instanceID: string
}

export default function CoreInstance(props: Props) {
    const [viewData, setViewData] = useState(false)

    const cloud = useCloudClient()

    const { isError, error: err, isLoading, data: coreInstance } = useQuery(
        ["core_instance", props.instanceID],
        ({ signal }) => cloud.fetchCoreInstance(signal, props.instanceID).then(resp => resp.data),
        {
            refetchInterval: 3000, // 3s
        },
    )

    if (viewData) {
        return (
            <Vivo setViewData={setViewData} />
        )
    }

    return (
        <Box mb={10}>
            <StyledCard title={coreInstance?.name ?? props.instanceID} subheader={coreInstance?.id} action={coreInstance !== undefined ? (
                <CoreInstanceMenu instanceID={coreInstance.id} />
            ) : undefined}>
                {isError ? (
                    <Alert iconMapping={{
                        error: <ErrorIcon fontSize="inherit" />,
                    }} severity="error" color="error">
                        <AlertTitle>Could not fetch core instance from Cloud</AlertTitle>
                        {(err as Error).message}
                    </Alert>
                ) : isLoading ? (
                    <LinearProgress />
                ) : (
                    <CoreInstanceView coreInstance={coreInstance} />
                )}
            </StyledCard>
            <Card sx={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", padding: "1rem" }}>
                <div>
                    <Typography color="#0D3D61" variant="body1" fontWeight={500}>
                        Check your live data on our Vivo Space
                    </Typography>
                    <Typography color="#0D3D61" variant="body1">
                        All your events in only one space
                    </Typography>
                </div>
                <Button variant="contained" sx={{ backgroundColor: "#1669AA" }} onClick={() => setViewData(true)}>View now</Button>
            </Card>
        </Box>
    )
}

type CoreInstanceViewProps = {
    coreInstance: CoreInstanceType
}

function CoreInstanceView(props: CoreInstanceViewProps) {
    delete props.coreInstance["token"]
    return (
        <Stack>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box bgcolor="#FAFAFA" color="#0D3D61" p={2} borderRadius={1} border="1px solid rgba(63, 81, 181, 0.08)">
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" pb={2}>
                            <Typography variant="body1" fontWeight={500}>Core</Typography>
                            <CoreInstanceStatusChip status={props.coreInstance.status} />
                        </Stack>
                        <Divider />
                        <Box display="grid" gridTemplateColumns="auto 1fr" gridTemplateRows="auto" mt={2} gap={2}>
                            <Typography sx={{ opacity: 0.7 }}>Name</Typography>
                            <Typography>{props.coreInstance.name}</Typography>

                            <Typography sx={{ opacity: 0.7 }}>Version</Typography>
                            <Typography>{props.coreInstance.version}</Typography>

                            {Array.isArray(props.coreInstance.tags) && props.coreInstance.tags.length !== 0 ? (
                                <>
                                    <Typography sx={{ opacity: 0.7 }}>Tags</Typography>
                                    <Stack direction="row" gap={1}>{props.coreInstance.tags.map(tag => (
                                        <Chip key={tag} label={tag} />
                                    ))}</Stack>
                                </>
                            ) : null}
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box bgcolor="#FAFAFA" color="#0D3D61" p={2} borderRadius={1} border="1px solid rgba(63, 81, 181, 0.08)" height="100%">
                        <Typography variant="body1" fontWeight={500} pb={2} pt={1}>Kubernetes</Typography>
                        <Divider />
                        <Box display="grid" gridTemplateColumns="auto 1fr" gridTemplateRows="auto" mt={2} gap={2}>
                            <Typography sx={{ opacity: 0.7 }}>Cluster Name</Typography>
                            <Typography>{props.coreInstance.metadata?.["k8s.cluster_name"] ?? "Unknown"}</Typography>

                            <Typography sx={{ opacity: 0.7 }}>Version</Typography>
                            <Typography>{props.coreInstance.metadata?.["k8s.cluster_version"] ?? "Unknown"}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid >
            <Stack my={4} alignItems="center" gap={2}>
                <Typography sx={{ color: "#0D3D61" }}>Manage your core instance from your browser:</Typography>
                <ManageCoreBtn instanceID={props.coreInstance.id} />
            </Stack>
        </Stack >
    )
}

type ManageCoreBtnProps = {
    instanceID: string
}

function ManageCoreBtn(props: ManageCoreBtnProps) {
    const dd = useDockerDesktopClient()

    return (
        <Button startIcon={<img src={birdDarkSrc} alt="Calyptia bird" />} variant="contained" sx={{ backgroundColor: "#1669AA" }} onClick={() => {
            const host = process.env.REACT_APP_CLOUD_BASE_URL !== "https://cloud-api.calyptia.com" ? "core-next.calyptia.com" : "core.calyptia.com"
            dd.host.openExternal(`https://${host}/${encodeURIComponent(props.instanceID)}`)
        }}>Manage Core</Button>
    )
}

type CoreInstanceStatusProps = {
    status: CoreInstanceStatus
}

function CoreInstanceStatusChip(props: CoreInstanceStatusProps) {
    let c: ChipTypeMap["props"]["color"] = "default"
    switch (props.status) {
        case CoreInstanceStatus.unreachable:
            c = "error"
            break
        case CoreInstanceStatus.running:
            c = "success"
            break
    }
    return <Chip label={props.status} color={c} />
}
