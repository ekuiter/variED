package de.ovgu.spldev.varied;

import org.pmw.tinylog.Logger;

import java.util.*;

public class VotingPhase {
    static class VotingStrategy {
        interface IVoters {
            void onJoin(Collaborator collaborator);
            void onLeave(Collaborator collaborator);
            boolean isEligible(Collaborator collaborator);

            class Everyone implements IVoters {
                private Set<Collaborator> voters;

                Everyone(Collection<Collaborator> collaborators) {
                    voters = new HashSet<>(collaborators);
                }

                public void onJoin(Collaborator collaborator) {
                    voters.add(collaborator);
                }

                public void onLeave(Collaborator collaborator) {
                    voters.remove(collaborator);
                }

                public boolean isEligible(Collaborator collaborator) {
                    return voters.contains(collaborator);
                }
            }
        }

        interface IResolutionCriterion {
            boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults);

            class OnFirstVote implements IResolutionCriterion {
                public boolean isResolved(IVoters voters, Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().size() > 0;
                }
            }
        }

        interface IResolutionOutcome {
            String getVersionID(Map<Collaborator, String> voteResults);

            class Any implements IResolutionOutcome {
                public String getVersionID(Map<Collaborator, String> voteResults) {
                    return voteResults.entrySet().iterator().next().getValue();
                }
            }
        }

        IVoters voters;
        IResolutionCriterion resolutionCriterion;
        IResolutionOutcome resolutionOutcome;

        public VotingStrategy(IVoters voters, IResolutionCriterion resolutionCriterion, IResolutionOutcome resolutionOutcome) {
            this.voters = voters;
            this.resolutionCriterion = resolutionCriterion;
            this.resolutionOutcome = resolutionOutcome;
        }

        static VotingStrategy createSimple(Collection<Collaborator> collaborators) {
            return new VotingStrategy(
                    new IVoters.Everyone(collaborators),
                    new IResolutionCriterion.OnFirstVote(),
                    new IResolutionOutcome.Any());
        }
    }

    private VotingStrategy votingStrategy;
    private Map<Collaborator, String> voteResults;

    public VotingPhase(VotingStrategy votingStrategy) {
        Logger.info("initializing voting phase");
        this.votingStrategy = votingStrategy;
        voteResults = new HashMap<>();
    }

    public boolean vote(Collaborator collaborator, String versionID) {
        Logger.info("{} voted for version {}", collaborator, versionID);
        if (versionID == null)
            voteResults.remove(collaborator);
        else
            voteResults.put(collaborator, versionID);

        if (votingStrategy.resolutionCriterion.isResolved(votingStrategy.voters, voteResults)) {
            Logger.info("resolution criterion triggered, concluding voting phsae");
            conclude();
            return true;
        }
        return false;
    }

    private void conclude() {
        String versionID = votingStrategy.resolutionOutcome.getVersionID(voteResults);
        Logger.info("resolution outcome is version {}", versionID);
        Logger.info("TODO: tell the kernel, tell everyone else");
    }

    public boolean isEligible(Collaborator collaborator) {
        return votingStrategy.voters.isEligible(collaborator);
    }

    public void onJoin(Collaborator collaborator) {
        votingStrategy.voters.onJoin(collaborator);
    }

    public void onLeave(Collaborator collaborator) {
        votingStrategy.voters.onLeave(collaborator);
    }
}
